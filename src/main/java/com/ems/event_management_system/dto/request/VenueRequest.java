package com.ems.event_management_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VenueRequest {

    @NotBlank(message = "Venue name is required")
    private String venueName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String stateName;

    private String country;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    private String contactPerson;

    private String contactPhone;
}