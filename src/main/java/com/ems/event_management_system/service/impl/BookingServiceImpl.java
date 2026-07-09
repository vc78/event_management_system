package com.ems.event_management_system.service.impl;

import com.ems.event_management_system.dto.request.BookingRequest;
import com.ems.event_management_system.dto.response.BookingResponse;
import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.entity.Event;
import com.ems.event_management_system.entity.User;
import com.ems.event_management_system.enums.BookingStatus;
import com.ems.event_management_system.exception.BadRequestException;
import com.ems.event_management_system.exception.ResourceNotFoundException;
import com.ems.event_management_system.repository.BookingRepository;
import com.ems.event_management_system.repository.EventRepository;
import com.ems.event_management_system.repository.UserRepository;
import com.ems.event_management_system.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Override
    public BookingResponse createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        if (request.getNumberOfTickets() <= 0) {
            throw new BadRequestException("Number of tickets must be greater than 0");
        }

        if (event.getAvailableSeats() < request.getNumberOfTickets()) {
            throw new BadRequestException("Not enough seats available");
        }

        BigDecimal totalAmount = event.getTicketPrice()
                .multiply(BigDecimal.valueOf(request.getNumberOfTickets()));

        event.setAvailableSeats(event.getAvailableSeats() - request.getNumberOfTickets());
        eventRepository.save(event);

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .numberOfTickets(request.getNumberOfTickets())
                .totalAmount(totalAmount)
                .bookingTime(LocalDateTime.now())
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus("PAID")
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByEvent(Long eventId) {
        return bookingRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + booking.getNumberOfTickets());
        eventRepository.save(event);

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus("REFUNDED");

        Booking updated = bookingRepository.save(booking);
        return mapToResponse(updated);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .eventTitle(booking.getEvent() != null ? booking.getEvent().getEventTitle() : null)
                .numberOfTickets(booking.getNumberOfTickets())
                .totalAmount(booking.getTotalAmount())
                .bookingTime(booking.getBookingTime())
                .bookingStatus(booking.getBookingStatus())
                .paymentStatus(booking.getPaymentStatus())
                .build();
    }
}