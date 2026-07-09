package com.ems.event_management_system.service.impl;

import com.ems.event_management_system.dto.request.EventRequest;
import com.ems.event_management_system.dto.response.EventResponse;
import com.ems.event_management_system.entity.Category;
import com.ems.event_management_system.entity.Event;
import com.ems.event_management_system.entity.User;
import com.ems.event_management_system.entity.Venue;
import com.ems.event_management_system.enums.EventStatus;
import com.ems.event_management_system.exception.ResourceNotFoundException;
import com.ems.event_management_system.repository.CategoryRepository;
import com.ems.event_management_system.repository.EventRepository;
import com.ems.event_management_system.repository.UserRepository;
import com.ems.event_management_system.repository.VenueRepository;
import com.ems.event_management_system.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    @Override
    public EventResponse createEvent(EventRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + request.getVenueId()));

        User organizer = null;
        if (request.getOrganizerId() != null) {
            organizer = userRepository.findById(request.getOrganizerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organizer not found with id: " + request.getOrganizerId()));
        }

        Event event = Event.builder()
                .eventTitle(request.getEventTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .ticketPrice(request.getTicketPrice())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .bannerUrl(request.getBannerUrl())
                .eventStatus(request.getEventStatus())
                .category(category)
                .venue(venue)
                .organizer(organizer)
                .build();

        Event saved = eventRepository.save(event);
        return mapToResponse(saved);
    }

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToResponse(event);
    }

    @Override
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + request.getVenueId()));

        User organizer = null;
        if (request.getOrganizerId() != null) {
            organizer = userRepository.findById(request.getOrganizerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organizer not found with id: " + request.getOrganizerId()));
        }

        event.setEventTitle(request.getEventTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setTicketPrice(request.getTicketPrice());
        event.setTotalSeats(request.getTotalSeats());
        event.setBannerUrl(request.getBannerUrl());
        event.setEventStatus(request.getEventStatus());
        event.setCategory(category);
        event.setVenue(venue);
        event.setOrganizer(organizer);

        Event updated = eventRepository.save(event);
        return mapToResponse(updated);
    }

    @Override
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        eventRepository.delete(event);
    }

    @Override
    public List<EventResponse> getEventsByStatus(EventStatus status) {
        return eventRepository.findByEventStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EventResponse> getEventsByDate(java.time.LocalDate date) {
        return eventRepository.findByEventDate(date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EventResponse> searchEventsByTitle(String keyword) {
        return eventRepository.findByEventTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EventResponse> getEventsByCategory(Long categoryId) {
        return eventRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EventResponse> getEventsByVenue(Long venueId) {
        return eventRepository.findByVenueId(venueId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private EventResponse mapToResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .eventTitle(event.getEventTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .ticketPrice(event.getTicketPrice())
                .totalSeats(event.getTotalSeats())
                .availableSeats(event.getAvailableSeats())
                .bannerUrl(event.getBannerUrl())
                .eventStatus(event.getEventStatus())
                .categoryName(event.getCategory() != null ? event.getCategory().getCategoryName() : null)
                .venueName(event.getVenue() != null ? event.getVenue().getVenueName() : null)
                .organizerName(event.getOrganizer() != null ? event.getOrganizer().getFullName() : null)
                .build();
    }
}