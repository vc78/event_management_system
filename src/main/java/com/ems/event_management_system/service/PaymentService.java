package com.ems.event_management_system.service;

import com.ems.event_management_system.dto.request.CreateOrderRequest;
import com.ems.event_management_system.dto.response.CreateOrderResponse;
import com.ems.event_management_system.dto.request.VerifyPaymentRequest;
import com.ems.event_management_system.dto.response.BookingResponse;

public interface PaymentService {
    CreateOrderResponse createOrder(CreateOrderRequest request);
    BookingResponse verifyPayment(VerifyPaymentRequest request);
    void handleWebhook(String payload, String signatureHeader);
}
