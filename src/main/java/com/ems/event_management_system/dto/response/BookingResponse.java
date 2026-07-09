package com.ems.event_management_system.dto.response;

import com.ems.event_management_system.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String userName;
    private String eventTitle;
    private Integer numberOfTickets;
    private BigDecimal totalAmount;
    private LocalDateTime bookingTime;
    private BookingStatus bookingStatus;
    private String paymentStatus;
}