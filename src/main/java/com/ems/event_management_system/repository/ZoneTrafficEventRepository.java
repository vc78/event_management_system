package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.ZoneTrafficEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ZoneTrafficEventRepository extends JpaRepository<ZoneTrafficEvent, Long> {
    List<ZoneTrafficEvent> findByZoneIdAndTimestampAfterOrderByTimestampAsc(String zoneId, LocalDateTime after);
}
