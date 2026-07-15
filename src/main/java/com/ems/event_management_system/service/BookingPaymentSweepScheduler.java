package com.ems.event_management_system.service;

import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.enums.BookingStatus;
import com.ems.event_management_system.enums.PaymentStatus;
import com.ems.event_management_system.event.BookingCommittedEvent;
import com.ems.event_management_system.repository.BookingRepository;
import com.ems.event_management_system.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingPaymentSweepScheduler {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Scheduled(fixedRate = 60000) // run every minute
    @Transactional
    public void sweepExpiredPendingBookings() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(20);
        List<Booking> pendingBookings = bookingRepository.findByBookingStatus(BookingStatus.PENDING);

        for (Booking booking : pendingBookings) {
            if (booking.getBookingTime().isBefore(threshold)) {
                log.info("Sweeping expired pending booking ID: {}, order ID: {}", booking.getId(), booking.getRazorpayOrderId());
                
                booking.setBookingStatus(BookingStatus.CANCELLED);
                booking.setPaymentStatus(PaymentStatus.FAILED);
                
                // Release seats
                eventRepository.incrementSeats(booking.getEvent().getId(), booking.getNumberOfTickets());
                
                Booking saved = bookingRepository.save(booking);
                
                // Publish WS change event
                applicationEventPublisher.publishEvent(new BookingCommittedEvent(this, saved, booking.getEvent()));
            }
        }
    }
}
