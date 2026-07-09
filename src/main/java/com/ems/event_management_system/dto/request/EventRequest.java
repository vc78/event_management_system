package com.ems.event_management_system.dto.request;

import com.ems.event_management_system.enums.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EventRequest {

    @NotBlank(message = "Event title is required")
    private String eventTitle;

    private String description;

    @NotNull(message = "Event date is required")
    private LocalDate eventDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    private LocalTime endTime;

    @NotNull(message = "Ticket price is required")
    private BigDecimal ticketPrice;

    @NotNull(message = "Total seats is required")
    private Integer totalSeats;

    private String bannerUrl;

    @NotNull(message = "Event status is required")
    private EventStatus eventStatus;

    @NotNull(message = "Category id is required")
    private Long categoryId;

    @NotNull(message = "Venue id is required")
    private Long venueId;

    private Long organizerId;
}