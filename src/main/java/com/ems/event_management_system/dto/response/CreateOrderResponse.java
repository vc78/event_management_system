package com.ems.event_management_system.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateOrderResponse {
    private Long bookingId;
    private String razorpayOrderId;
    private long amount; // in paise
    private String currency;
    private String razorpayKeyId;
}
