package com.ems.event_management_system.service.impl;

import com.ems.event_management_system.dto.request.CreateOrderRequest;
import com.ems.event_management_system.dto.request.VerifyPaymentRequest;
import com.ems.event_management_system.dto.response.BookingResponse;
import com.ems.event_management_system.dto.response.CreateOrderResponse;
import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.entity.Event;
import com.ems.event_management_system.entity.User;
import com.ems.event_management_system.enums.BookingStatus;
import com.ems.event_management_system.enums.PaymentStatus;
import com.ems.event_management_system.event.BookingCommittedEvent;
import com.ems.event_management_system.exception.BadRequestException;
import com.ems.event_management_system.exception.ResourceNotFoundException;
import com.ems.event_management_system.exception.SeatUnavailableException;
import com.ems.event_management_system.repository.BookingRepository;
import com.ems.event_management_system.repository.EventRepository;
import com.ems.event_management_system.repository.UserRepository;
import com.ems.event_management_system.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RazorpayClient razorpayClient;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @Value("${razorpay.currency}")
    private String currency;

    @Override
    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        if (request.getNumberOfTickets() <= 0) {
            throw new BadRequestException("Number of tickets must be greater than 0");
        }

        // Atomically lock seats
        int updatedRows = eventRepository.decrementSeatsIfAvailable(request.getEventId(), request.getNumberOfTickets());
        if (updatedRows == 0) {
            throw new SeatUnavailableException("Not enough seats available");
        }

        // Compute total amount server-side (in currency)
        BigDecimal totalAmount = event.getTicketPrice()
                .multiply(BigDecimal.valueOf(request.getNumberOfTickets()));

        String generatedTokenId;
        do {
            generatedTokenId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (bookingRepository.existsByTokenId(generatedTokenId));

        long amountInPaise = totalAmount.multiply(BigDecimal.valueOf(100)).longValue();

        Order razorpayOrder;
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", generatedTokenId);

            razorpayOrder = razorpayClient.orders.create(orderRequest);
        } catch (Exception e) {
            log.error("Failed to create Razorpay order, rolling back seat reservation.", e);
            // Roll back seat hold
            eventRepository.incrementSeats(request.getEventId(), request.getNumberOfTickets());
            throw new BadRequestException("Payment order creation failed: " + e.getMessage());
        }

        Booking booking = Booking.builder()
                .tokenId(generatedTokenId)
                .user(user)
                .event(event)
                .numberOfTickets(request.getNumberOfTickets())
                .totalAmount(totalAmount)
                .bookingTime(LocalDateTime.now())
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.CREATED)
                .razorpayOrderId(razorpayOrder.get("id").toString())
                .build();

        Booking saved = bookingRepository.save(booking);

        return CreateOrderResponse.builder()
                .bookingId(saved.getId())
                .razorpayOrderId(saved.getRazorpayOrderId())
                .amount(amountInPaise)
                .currency(currency)
                .razorpayKeyId(razorpayKeyId)
                .build();
    }

    @Override
    @Transactional
    public BookingResponse verifyPayment(VerifyPaymentRequest request) {
        Booking booking = bookingRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for order id: " + request.getRazorpayOrderId()));

        if (!booking.getId().equals(request.getBookingId())) {
            throw new BadRequestException("Booking ID mismatch");
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            // Utils.verifyPaymentSignature returns a boolean or throws RazorpayException
            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            if (!isValid) {
                throw new BadRequestException("Signature verification failed: invalid signature");
            }
        } catch (Exception e) {
            throw new BadRequestException("Signature verification failed: " + e.getMessage());
        }

        // Idempotent confirmation
        if (booking.getBookingStatus() == BookingStatus.PENDING) {
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setRazorpayPaymentId(request.getRazorpayPaymentId());
            booking.setRazorpaySignature(request.getRazorpaySignature());
            Booking saved = bookingRepository.save(booking);

            applicationEventPublisher.publishEvent(new BookingCommittedEvent(this, saved, booking.getEvent()));
            return mapToResponse(saved);
        }

        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String signatureHeader) {
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signatureHeader, webhookSecret);
            if (!isValid) {
                throw new BadRequestException("Invalid webhook signature");
            }
        } catch (Exception e) {
            throw new BadRequestException("Webhook signature verification failed: " + e.getMessage());
        }

        JSONObject webhookPayload = new JSONObject(payload);
        String eventType = webhookPayload.optString("event");
        JSONObject payloadObj = webhookPayload.optJSONObject("payload");
        if (payloadObj == null) {
            return;
        }

        JSONObject paymentObj = payloadObj.optJSONObject("payment");
        if (paymentObj == null) {
            return;
        }

        JSONObject paymentEntity = paymentObj.optJSONObject("entity");
        if (paymentEntity == null) {
            return;
        }

        String orderId = paymentEntity.optString("order_id");
        String paymentId = paymentEntity.optString("id");

        if (orderId == null || orderId.isEmpty()) {
            return;
        }

        Booking booking = bookingRepository.findByRazorpayOrderId(orderId).orElse(null);
        if (booking == null) {
            log.warn("Webhook received for unknown Razorpay order ID: {}", orderId);
            return;
        }

        if ("payment.captured".equals(eventType)) {
            if (booking.getBookingStatus() == BookingStatus.PENDING) {
                booking.setBookingStatus(BookingStatus.CONFIRMED);
                booking.setPaymentStatus(PaymentStatus.PAID);
                booking.setRazorpayPaymentId(paymentId);
                Booking saved = bookingRepository.save(booking);
                applicationEventPublisher.publishEvent(new BookingCommittedEvent(this, saved, booking.getEvent()));
                log.info("Booking ID {} confirmed via webhook payment.captured", booking.getId());
            }
        } else if ("payment.failed".equals(eventType)) {
            if (booking.getBookingStatus() == BookingStatus.PENDING) {
                booking.setBookingStatus(BookingStatus.CANCELLED);
                booking.setPaymentStatus(PaymentStatus.FAILED);
                booking.setRazorpayPaymentId(paymentId);
                eventRepository.incrementSeats(booking.getEvent().getId(), booking.getNumberOfTickets());
                Booking saved = bookingRepository.save(booking);
                applicationEventPublisher.publishEvent(new BookingCommittedEvent(this, saved, booking.getEvent()));
                log.info("Booking ID {} cancelled via webhook payment.failed", booking.getId());
            }
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .tokenId(booking.getTokenId())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .userEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .eventId(booking.getEvent() != null ? booking.getEvent().getId() : null)
                .eventTitle(booking.getEvent() != null ? booking.getEvent().getEventTitle() : null)
                .categoryName((booking.getEvent() != null && booking.getEvent().getCategory() != null) ? booking.getEvent().getCategory().getCategoryName() : null)
                .venueName((booking.getEvent() != null && booking.getEvent().getVenue() != null) ? booking.getEvent().getVenue().getVenueName() : null)
                .eventDate(booking.getEvent() != null ? booking.getEvent().getEventDate() : null)
                .startTime(booking.getEvent() != null ? booking.getEvent().getStartTime() : null)
                .numberOfTickets(booking.getNumberOfTickets())
                .totalAmount(booking.getTotalAmount())
                .bookingTime(booking.getBookingTime())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .checkedIn(booking.getCheckedIn())
                .checkInTime(booking.getCheckInTime())
                .build();
    }
}
