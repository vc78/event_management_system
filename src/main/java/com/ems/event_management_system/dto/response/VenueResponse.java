package com.ems.event_management_system.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VenueResponse {
    private Long id;
    private String venueName;
    private String address;
    private String city;
    private String stateName;
    private String country;
    private Integer capacity;
    private String contactPerson;
    private String contactPhone;
}