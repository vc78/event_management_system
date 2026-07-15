package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.Booking;
import com.ems.event_management_system.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByEventId(Long eventId);

    List<Booking> findByBookingStatus(BookingStatus bookingStatus);

    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);

    long countByBookingStatus(BookingStatus bookingStatus);
    
    boolean existsByTokenId(String tokenId);
}