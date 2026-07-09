package com.ems.event_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "referral_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralLink extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "referrer_id", nullable = false)
    private Long referrerId;

    @Column(name = "referral_code", nullable = false, unique = true)
    private String referralCode;

    @Column(name = "clicks", nullable = false)
    private Integer clicks = 0;

    @Column(name = "conversions", nullable = false)
    private Integer conversions = 0;

    @Column(name = "commission_earned", nullable = false, precision = 10, scale = 2)
    private BigDecimal commissionEarned = BigDecimal.ZERO;
}
