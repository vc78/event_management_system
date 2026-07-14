package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "zone_traffic_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoneTrafficEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zone_id", nullable = false, length = 50)
    private String zoneId;

    @Column(name = "visitor_count", nullable = false)
    private Integer visitorCount;

    @Column(name = "dwell_seconds", nullable = false)
    private Integer dwellSeconds;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
