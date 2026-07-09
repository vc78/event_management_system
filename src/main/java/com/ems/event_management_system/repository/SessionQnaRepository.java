package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.SessionQna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionQnaRepository extends JpaRepository<SessionQna, Long> {
    List<SessionQna> findByEventIdOrderByUpvotesDesc(Long eventId);
}
