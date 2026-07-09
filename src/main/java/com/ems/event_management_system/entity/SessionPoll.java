package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_polls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionPoll extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "question", nullable = false)
    private String question;

    @Column(name = "options_json", nullable = false, columnDefinition = "TEXT")
    private String optionsJson; // comma-separated or JSON list of options

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
