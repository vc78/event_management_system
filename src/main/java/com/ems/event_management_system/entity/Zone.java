package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Zone {

    @Id
    @Column(name = "zone_id", length = 50)
    private String zoneId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "capacity_threshold", nullable = false)
    private Integer capacityThreshold;

    @Column(name = "current_visitor_count", nullable = false)
    private Integer currentVisitorCount = 0;

    @Column(name = "total_dwell_seconds", nullable = false)
    private Integer totalDwellSeconds = 0;
}
