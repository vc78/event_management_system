package com.ems.event_management_system.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an authenticated user attempts to access a resource
 * that belongs to a different user (e.g., another user's bookings).
 * Maps to HTTP 403 Forbidden via GlobalExceptionHandler.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
