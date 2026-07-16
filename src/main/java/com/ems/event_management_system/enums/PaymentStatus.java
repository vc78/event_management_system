package com.ems.event_management_system.enums;

public enum PaymentStatus {
    PENDING,   // legacy seed data value (also used as a fallback label before Razorpay order is created)
    CREATED,   // Razorpay order created, awaiting payment
    PAID,      // payment captured successfully
    FAILED,    // payment failed
    REFUNDED   // refund issued
}

