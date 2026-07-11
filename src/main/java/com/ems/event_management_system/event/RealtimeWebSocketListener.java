package com.ems.event_management_system.event;

import com.ems.event_management_system.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listens for domain-level ApplicationEvents published within @Transactional methods and
 * forwards them to the WebSocket broker ONLY after the surrounding transaction has
 * successfully committed.
 *
 * This prevents broadcasting stale / rolled-back state to connected clients (Phase A6).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RealtimeWebSocketListener {

    private final RealtimeEventPublisher realtimeEventPublisher;

    /**
     * Called after a booking transaction commits.
     * Publishes seat-availability + booking-status updates to all subscribed clients.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBookingCommitted(BookingCommittedEvent applicationEvent) {
        log.debug("A6 — onBookingCommitted: bookingId={}", applicationEvent.getBooking().getId());
        if (applicationEvent.getRelatedEvent() != null) {
            realtimeEventPublisher.publishEventStatusChange(applicationEvent.getRelatedEvent());
        }
        realtimeEventPublisher.publishBookingChange(applicationEvent.getBooking());
    }

    /**
     * Called after a scheduler-driven event-status transaction commits.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEventStatusChanged(EventStatusChangedEvent applicationEvent) {
        log.debug("A6 — onEventStatusChanged: eventId={}", applicationEvent.getEvent().getId());
        realtimeEventPublisher.publishEventStatusChange(applicationEvent.getEvent());
    }
}
