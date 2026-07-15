package com.ems.event_management_system.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Event id is required")
    private Long eventId;

    @NotNull(message = "Number of tickets is required")
    @Min(value = 1, message = "Number of tickets must be at least 1")
    @Max(value = 10, message = "Number of tickets cannot exceed 10")
    private Integer numberOfTickets;
}
