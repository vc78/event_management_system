package com.ems.event_management_system.service;

import com.ems.event_management_system.dto.request.BookingRequest;
import com.ems.event_management_system.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    BookingResponse getBookingById(Long id);

    List<BookingResponse> getAllBookings();

    List<BookingResponse> getBookingsByUser(Long userId);

    List<BookingResponse> getBookingsByEvent(Long eventId);

    BookingResponse cancelBooking(Long bookingId);
}