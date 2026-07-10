package com.ems.event_management_system.service;

import com.ems.event_management_system.entity.Event;
import com.ems.event_management_system.enums.EventStatus;
import com.ems.event_management_system.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventStatusScheduler {

    private final EventRepository eventRepository;
    private final RealtimeEventPublisher realtimeEventPublisher;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void updateEventStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // Check UPCOMING events
        List<Event> upcomingEvents = eventRepository.findByEventStatus(EventStatus.UPCOMING);
        for (Event event : upcomingEvents) {
            LocalDateTime startDateTime = event.getEventDate().atTime(event.getStartTime());
            LocalDateTime endDateTime = event.getEndTime() != null 
                    ? event.getEventDate().atTime(event.getEndTime()) 
                    : startDateTime.plusHours(1); // default if no end time

            if (now.isAfter(endDateTime) || now.isEqual(endDateTime)) {
                event.setEventStatus(EventStatus.COMPLETED);
                eventRepository.save(event);
                realtimeEventPublisher.publishEventStatusChange(event);
            } else if (now.isAfter(startDateTime) || now.isEqual(startDateTime)) {
                event.setEventStatus(EventStatus.ONGOING);
                eventRepository.save(event);
                realtimeEventPublisher.publishEventStatusChange(event);
            }
        }

        // Check ONGOING events
        List<Event> ongoingEvents = eventRepository.findByEventStatus(EventStatus.ONGOING);
        for (Event event : ongoingEvents) {
            LocalDateTime startDateTime = event.getEventDate().atTime(event.getStartTime());
            LocalDateTime endDateTime = event.getEndTime() != null 
                    ? event.getEventDate().atTime(event.getEndTime()) 
                    : startDateTime.plusHours(1);

            if (now.isAfter(endDateTime) || now.isEqual(endDateTime)) {
                event.setEventStatus(EventStatus.COMPLETED);
                eventRepository.save(event);
                realtimeEventPublisher.publishEventStatusChange(event);
            }
        }
    }
}
