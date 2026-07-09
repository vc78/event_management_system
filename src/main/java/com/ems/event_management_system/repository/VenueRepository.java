package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
}