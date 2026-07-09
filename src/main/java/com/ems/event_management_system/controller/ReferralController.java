package com.ems.event_management_system.controller;

import com.ems.event_management_system.entity.ReferralLink;
import com.ems.event_management_system.repository.ReferralLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReferralController {

    private final ReferralLinkRepository referralLinkRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Optional<ReferralLink>> getReferralByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(referralLinkRepository.findByReferrerId(userId));
    }

    @PostMapping
    public ResponseEntity<ReferralLink> createReferral(@RequestBody ReferralLink link) {
        link.setClicks(0);
        link.setConversions(0);
        link.setCommissionEarned(BigDecimal.ZERO);
        return new ResponseEntity<>(referralLinkRepository.save(link), HttpStatus.CREATED);
    }

    @PutMapping("/click/{code}")
    public ResponseEntity<?> registerClick(@PathVariable String code) {
        ReferralLink link = referralLinkRepository.findByReferralCode(code)
                .orElseThrow(() -> new RuntimeException("Referral code not found"));
        link.setClicks(link.getClicks() + 1);
        referralLinkRepository.save(link);
        return ResponseEntity.ok(Map.of("message", "Click registered"));
    }

    @PutMapping("/convert/{code}")
    public ResponseEntity<?> registerConversion(@PathVariable String code, @RequestParam BigDecimal ticketPrice) {
        ReferralLink link = referralLinkRepository.findByReferralCode(code)
                .orElseThrow(() -> new RuntimeException("Referral code not found"));
        link.setConversions(link.getConversions() + 1);
        
        // 10% commission rate
        BigDecimal commission = ticketPrice.multiply(new BigDecimal("0.10"));
        link.setCommissionEarned(link.getCommissionEarned().add(commission));
        
        referralLinkRepository.save(link);
        return ResponseEntity.ok(Map.of("message", "Conversion registered", "commissionEarned", commission));
    }
}
