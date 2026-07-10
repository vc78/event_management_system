package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.Event;
import com.ems.event_management_system.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByEventStatus(EventStatus eventStatus);

    List<Event> findByEventDate(LocalDate eventDate);

    List<Event> findByEventTitleContainingIgnoreCase(String keyword);

    List<Event> findByCategoryId(Long categoryId);

    List<Event> findByVenueId(Long venueId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Event e SET e.availableSeats = e.availableSeats - :tickets WHERE e.id = :eventId AND e.availableSeats >= :tickets")
    int decrementSeatsIfAvailable(Long eventId, Integer tickets);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Event e SET e.availableSeats = e.availableSeats + :tickets WHERE e.id = :eventId AND (e.availableSeats + :tickets) <= e.totalSeats")
    int incrementSeats(Long eventId, Integer tickets);
}