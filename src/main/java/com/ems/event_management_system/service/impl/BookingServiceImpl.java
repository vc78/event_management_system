package com.ems.event_management_system.service.impl;

import com.ems.event_management_system.dto.request.BookingRequest;
import com.ems.event_management_system.dto.response.BookingResponse;
import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.entity.Event;
import com.ems.event_management_system.entity.User;
import com.ems.event_management_system.enums.BookingStatus;
import com.ems.event_management_system.event.BookingCommittedEvent;
import com.ems.event_management_system.exception.BadRequestException;
import com.ems.event_management_system.exception.ForbiddenException;
import com.ems.event_management_system.exception.ResourceNotFoundException;
import com.ems.event_management_system.exception.SeatUnavailableException;
import com.ems.event_management_system.repository.BookingRepository;
import com.ems.event_management_system.repository.EventRepository;
import com.ems.event_management_system.repository.UserRepository;
import com.ems.event_management_system.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    // ── Helper: check if the current principal has ADMIN or ORGANIZER role ──
    private boolean isAdminOrOrganizer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        return authorities.stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_ADMIN") ||
                a.getAuthority().equals("ROLE_ORGANIZER")
        );
    }

    // ── Helper: resolve the User entity for the currently authenticated principal ──
    private User resolveCallerUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        if (request.getNumberOfTickets() <= 0) {
            throw new BadRequestException("Number of tickets must be greater than 0");
        }

        int updatedRows = eventRepository.decrementSeatsIfAvailable(request.getEventId(), request.getNumberOfTickets());
        if (updatedRows == 0) {
            throw new SeatUnavailableException("Not enough seats available");
        }

        BigDecimal totalAmount = event.getTicketPrice()
                .multiply(BigDecimal.valueOf(request.getNumberOfTickets()));

        String generatedTokenId;
        do {
            generatedTokenId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (bookingRepository.existsByTokenId(generatedTokenId));

        Booking booking = Booking.builder()
                .tokenId(generatedTokenId)
                .user(user)
                .event(event)
                .numberOfTickets(request.getNumberOfTickets())
                .totalAmount(totalAmount)
                .bookingTime(LocalDateTime.now())
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus("PAID")
                .build();

        Booking saved = bookingRepository.save(booking);

        // A6: Publish after-commit event so WS message is sent only when DB commit succeeds
        applicationEventPublisher.publishEvent(new BookingCommittedEvent(this, saved, event));

        return mapToResponse(saved);
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // D02b: Ownership check — only the booking owner OR admin/organizer can view
        if (!isAdminOrOrganizer()) {
            User caller = resolveCallerUser();
            if (caller == null || !caller.getId().equals(booking.getUser().getId())) {
                // Use ResourceNotFoundException to avoid confirming the booking exists
                throw new ResourceNotFoundException("Booking not found with id: " + id);
            }
        }

        return mapToResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        // Already restricted to ADMIN/ORGANIZER by SecurityConfig (D02a)
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByUser(Long userId) {
        // D02b: Ownership enforcement
        // Admin and Organizer roles are allowed through unconditionally.
        // A plain USER may only request their own userId.
        if (!isAdminOrOrganizer()) {
            User caller = resolveCallerUser();
            if (caller == null || !caller.getId().equals(userId)) {
                throw new ForbiddenException("Access denied: you can only view your own bookings");
            }
        }

        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByEvent(Long eventId) {
        // Already restricted to ADMIN/ORGANIZER by SecurityConfig (D02a)
        return bookingRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        eventRepository.incrementSeats(booking.getEvent().getId(), booking.getNumberOfTickets());

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus("REFUNDED");

        Booking updated = bookingRepository.save(booking);

        // A6: Publish after-commit event so WS message is sent only when DB commit succeeds
        applicationEventPublisher.publishEvent(new BookingCommittedEvent(this, updated, booking.getEvent()));

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public BookingResponse checkInBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is cancelled");
        }

        if (Boolean.TRUE.equals(booking.getCheckedIn())) {
            throw new BadRequestException("Ticket is already checked in");
        }

        if (booking.getEvent().getEventDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Ticket has expired");
        }

        booking.setCheckedIn(true);
        booking.setCheckInTime(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // A6: Check-in has no seat change, so relatedEvent is null
        applicationEventPublisher.publishEvent(new BookingCommittedEvent(this, saved, null));

        return mapToResponse(saved);
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