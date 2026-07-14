package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sponsor_id", nullable = false)
    private Long sponsorId;

    @Column(name = "attendee_id", nullable = false)
    private Long attendeeId;

    @Column(name = "consent_given", nullable = false)
    private Boolean consentGiven = false;

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;
}
