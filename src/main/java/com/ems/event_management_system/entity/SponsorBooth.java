package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sponsor_booths")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SponsorBooth extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sponsor_name", nullable = false)
    private String sponsorName;

    @Column(name = "booth_number", nullable = false)
    private String boothNumber;

    @Column(name = "tier", nullable = false)
    private String tier; // PLATINUM, GOLD, SILVER

    @Column(name = "lead_count", nullable = false)
    private Integer leadCount = 0;

    @Column(name = "booth_traffic", nullable = false)
    private Integer boothTraffic = 0;

    @Column(name = "booked_by_user_id")
    private Long bookedByUserId;
}
