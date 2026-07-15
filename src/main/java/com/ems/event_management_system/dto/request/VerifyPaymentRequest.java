package com.ems.event_management_system.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyPaymentRequest {

    @NotNull(message = "Booking id is required")
    private Long bookingId;

    @NotNull(message = "Razorpay order id is required")
    @JsonProperty("razorpay_order_id")
    private String razorpayOrderId;

    @NotNull(message = "Razorpay payment id is required")
    @JsonProperty("razorpay_payment_id")
    private String razorpayPaymentId;

    @NotNull(message = "Razorpay signature is required")
    @JsonProperty("razorpay_signature")
    private String razorpaySignature;
}
