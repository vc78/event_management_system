package com.ems.event_management_system.service.impl;

import com.ems.event_management_system.dto.response.DashboardResponse;
import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.enums.BookingStatus;
import com.ems.event_management_system.repository.*;
import com.ems.event_management_system.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final CategoryRepository categoryRepository;
    private final VenueRepository venueRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalBookings = bookingRepository.count();
        long totalCategories = categoryRepository.count();
        long totalVenues = venueRepository.count();

        List<Booking> bookings = bookingRepository.findAll();

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long confirmedBookings = bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository.countByBookingStatus(BookingStatus.CANCELLED);

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalEvents(totalEvents)
                .totalBookings(totalBookings)
                .totalCategories(totalCategories)
                .totalVenues(totalVenues)
                .totalRevenue(totalRevenue)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .build();
    }
}