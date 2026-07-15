package com.ems.event_management_system.dto.request;

import com.ems.event_management_system.enums.EventStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
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
    @FutureOrPresent(message = "Event date must not be in the past")
    private LocalDate eventDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    private LocalTime endTime;

    @NotNull(message = "Ticket price is required")
    @Min(value = 0, message = "Ticket price cannot be negative")
    private BigDecimal ticketPrice;

    @NotNull(message = "Total seats is required")
    private Integer totalSeats;

    private String bannerUrl;

    private String streamUrl;

    @NotNull(message = "Event status is required")
    private EventStatus eventStatus;

    @NotNull(message = "Category id is required")
    private Long categoryId;

    @NotNull(message = "Venue id is required")
    private Long venueId;

    private Long organizerId;
}