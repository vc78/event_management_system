package com.ems.event_management_system.controller;

import com.ems.event_management_system.dto.request.EventRequest;
import com.ems.event_management_system.dto.response.ApiResponse;
import com.ems.event_management_system.dto.response.EventResponse;
import com.ems.event_management_system.enums.EventStatus;
import com.ems.event_management_system.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        return new ResponseEntity<>(eventService.createEvent(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id,
                                                     @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(new ApiResponse(true, "Event deleted successfully"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EventResponse>> getEventsByStatus(@PathVariable EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<EventResponse>> getEventsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(eventService.getEventsByDate(date));
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventResponse>> searchEvents(@RequestParam String keyword) {
        return ResponseEntity.ok(eventService.searchEventsByTitle(keyword));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<EventResponse>> getEventsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(eventService.getEventsByCategory(categoryId));
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<EventResponse>> getEventsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(eventService.getEventsByVenue(venueId));
    }
}