package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.SessionPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionPollRepository extends JpaRepository<SessionPoll, Long> {
    List<SessionPoll> findByEventId(Long eventId);
    List<SessionPoll> findByEventIdAndIsActive(Long eventId, Boolean isActive);
}
