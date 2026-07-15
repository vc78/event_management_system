package com.ems.event_management_system.controller;

import com.ems.event_management_system.dto.request.CreateOrderRequest;
import com.ems.event_management_system.dto.request.VerifyPaymentRequest;
import com.ems.event_management_system.dto.response.BookingResponse;
import com.ems.event_management_system.dto.response.CreateOrderResponse;
import com.ems.event_management_system.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return new ResponseEntity<>(paymentService.createOrder(request), HttpStatus.CREATED);
    }

    @PostMapping("/verify")
    public ResponseEntity<BookingResponse> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signatureHeader) {
        paymentService.handleWebhook(payload, signatureHeader);
        return ResponseEntity.ok().build();
    }
}
