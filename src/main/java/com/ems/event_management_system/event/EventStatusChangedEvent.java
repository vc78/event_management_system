package com.ems.event_management_system.event;

import com.ems.event_management_system.entity.Event;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Published (inside a @Transactional method) when an Event's status or seat count changes
 * due to the scheduler (not tied to a booking).  Dispatched to clients after commit via
 * {@link RealtimeWebSocketListener}.
 */
@Getter
public class EventStatusChangedEvent extends ApplicationEvent {

    private final Event event;

    public EventStatusChangedEvent(Object source, Event event) {
        super(source);
        this.event = event;
    }
}
