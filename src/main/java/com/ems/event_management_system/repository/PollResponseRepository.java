package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.PollResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PollResponseRepository extends JpaRepository<PollResponse, Long> {
    List<PollResponse> findByPollId(Long pollId);
    boolean existsByPollIdAndUserId(Long pollId, Long userId);
}
