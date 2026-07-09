package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.SponsorBooth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SponsorBoothRepository extends JpaRepository<SponsorBooth, Long> {
    List<SponsorBooth> findByBookedByUserId(Long userId);
}
