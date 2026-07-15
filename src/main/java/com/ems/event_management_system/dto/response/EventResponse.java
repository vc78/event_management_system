package com.ems.event_management_system.dto.response;

import com.ems.event_management_system.enums.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class EventResponse {
    private Long id;
    private String eventTitle;
    private String description;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal ticketPrice;
    private Integer totalSeats;
    private Integer availableSeats;
    private String bannerUrl;
    private String streamUrl;
    private EventStatus eventStatus;
    // Denormalised name fields (read display)
    private String categoryName;
    private String venueName;
    private String organizerName;
    // Raw ID fields – required so the edit-form dropdowns can pre-select the
    // correct option (category select uses categoryId, venue select uses venueId)
    private Long categoryId;
    private Long venueId;
    private Long organizerId;
}