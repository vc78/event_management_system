package com.ems.event_management_system.repository;

import com.ems.event_management_system.entity.ReferralLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReferralLinkRepository extends JpaRepository<ReferralLink, Long> {
    Optional<ReferralLink> findByReferralCode(String referralCode);
    Optional<ReferralLink> findByReferrerId(Long referrerId);
}
