package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.SentimentWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface SentimentWordRepository extends JpaRepository<SentimentWord, Long> {
    
    @Query("SELECT s.word as text, COUNT(s.id) as count FROM SentimentWord s WHERE s.eventId = :eventId GROUP BY s.word")
    List<Map<String, Object>> countWordsByEventId(@Param("eventId") Long eventId);
}
