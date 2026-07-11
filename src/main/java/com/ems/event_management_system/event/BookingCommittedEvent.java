package com.ems.event_management_system.event;

import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.entity.Event;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published (inside a @Transactional method) after a Booking is saved.
 * The actual WebSocket message is sent only once the transaction commits,
 * via {@link RealtimeWebSocketListener}.
 */
@Getter
public class BookingCommittedEvent extends ApplicationEvent {

    private final Booking booking;
    /** May be null when only a booking-status change occurred (no seat update needed). */
    private final Event relatedEvent;

    public BookingCommittedEvent(Object source, Booking booking, Event relatedEvent) {
        super(source);
        this.booking = booking;
        this.relatedEvent = relatedEvent;
    }
}
