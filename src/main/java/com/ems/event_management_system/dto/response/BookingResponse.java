package com.ems.event_management_system.dto.response;

import com.ems.event_management_system.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String tokenId;
    private String userName;
    private String eventTitle;
    private Long eventId;
    private Long userId;
    private String userEmail;
    private String categoryName;
    private String venueName;
    private LocalDate eventDate;
    private LocalTime startTime;
    private Integer numberOfTickets;
    private BigDecimal totalAmount;
    private LocalDateTime bookingTime;
    private BookingStatus bookingStatus;
    private String paymentStatus;
    private Boolean checkedIn;
    private LocalDateTime checkInTime;
}