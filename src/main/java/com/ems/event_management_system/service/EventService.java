package com.ems.event_management_system.service;

import com.ems.event_management_system.dto.request.EventRequest;
import com.ems.event_management_system.dto.response.EventResponse;
import com.ems.event_management_system.enums.EventStatus;

import java.time.LocalDate;
import java.util.List;

public interface EventService {
    EventResponse createEvent(EventRequest request);
    List<EventResponse> getAllEvents();
    EventResponse getEventById(Long id);
    EventResponse updateEvent(Long id, EventRequest request);
    void deleteEvent(Long id);

    List<EventResponse> getEventsByStatus(EventStatus status);
    List<EventResponse> getEventsByDate(LocalDate date);
    List<EventResponse> searchEventsByTitle(String keyword);
    List<EventResponse> getEventsByCategory(Long categoryId);
    List<EventResponse> getEventsByVenue(Long venueId);
}