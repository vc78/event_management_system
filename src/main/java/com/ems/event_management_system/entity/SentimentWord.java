package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sentiment_words")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SentimentWord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "word", nullable = false, length = 50)
    private String word;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
