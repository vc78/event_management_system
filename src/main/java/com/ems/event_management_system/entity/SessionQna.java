package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_qnas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionQna extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "upvotes", nullable = false)
    private Integer upvotes = 0;

    @Column(name = "is_answered", nullable = false)
    private Boolean isAnswered = false;

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;
}
