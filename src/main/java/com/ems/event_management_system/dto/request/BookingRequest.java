package com.ems.event_management_system.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Event id is required")
    private Long eventId;

    @NotNull(message = "Number of tickets is required")
    private Integer numberOfTickets;
}