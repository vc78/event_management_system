package com.ems.event_management_system.service;

import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.entity.Event;
import com.ems.event_management_system.enums.BookingStatus;
import com.ems.event_management_system.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RealtimeEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final BookingRepository bookingRepository;

    public void publishEventStatusChange(Event event) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventId", event.getId());
        payload.put("availableSeats", event.getAvailableSeats());
        payload.put("eventStatus", event.getEventStatus().name());

        messagingTemplate.convertAndSend("/topic/events", payload);
        messagingTemplate.convertAndSend("/topic/events/" + event.getId(), payload);
    }

    public void publishBookingChange(Booking booking) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("bookingId", booking.getId());
        payload.put("status", booking.getBookingStatus().name());

        messagingTemplate.convertAndSend("/topic/bookings/" + booking.getUser().getId(), payload);

        // Also publish to admin dashboard stats
        publishAdminDashboardStats();
    }

    public void publishAdminDashboardStats() {
        List<Booking> allBookings = bookingRepository.findAll();
        
        long totalBookings = allBookings.size();
        long confirmedBookings = allBookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED).count();
        long cancelledBookings = allBookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED).count();
        
        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> payload = new HashMap<>();
        payload.put("totalBookings", totalBookings);
        payload.put("totalRevenue", totalRevenue);
        payload.put("confirmedBookings", confirmedBookings);
        payload.put("cancelledBookings", cancelledBookings);

        messagingTemplate.convertAndSend("/topic/admin/dashboard", payload);
    }
}
