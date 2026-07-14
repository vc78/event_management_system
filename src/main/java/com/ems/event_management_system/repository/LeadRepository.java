package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findBySponsorId(Long sponsorId);
    boolean existsBySponsorIdAndAttendeeId(Long sponsorId, Long attendeeId);
}
