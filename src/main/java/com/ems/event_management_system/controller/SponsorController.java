package com.ems.event_management_system.controller;

import com.ems.event_management_system.entity.SponsorBooth;
import com.ems.event_management_system.repository.SponsorBoothRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sponsors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SponsorController {

    private final SponsorBoothRepository sponsorBoothRepository;

    @GetMapping("/booths")
    public ResponseEntity<List<SponsorBooth>> getAllBooths() {
        return ResponseEntity.ok(sponsorBoothRepository.findAll());
    }

    @PostMapping("/booths")
    public ResponseEntity<SponsorBooth> createBooth(@RequestBody SponsorBooth booth) {
        booth.setLeadCount(0);
        booth.setBoothTraffic(0);
        return new ResponseEntity<>(sponsorBoothRepository.save(booth), HttpStatus.CREATED);
    }

    @PutMapping("/booths/book/{boothId}")
    public ResponseEntity<SponsorBooth> bookBooth(@PathVariable Long boothId, @RequestParam Long userId) {
        SponsorBooth booth = sponsorBoothRepository.findById(boothId)
                .orElseThrow(() -> new RuntimeException("Booth not found"));
        booth.setBookedByUserId(userId);
        return ResponseEntity.ok(sponsorBoothRepository.save(booth));
    }

    @PutMapping("/booths/traffic/{boothId}")
    public ResponseEntity<SponsorBooth> incrementTraffic(@PathVariable Long boothId) {
        SponsorBooth booth = sponsorBoothRepository.findById(boothId)
                .orElseThrow(() -> new RuntimeException("Booth not found"));
        booth.setBoothTraffic(booth.getBoothTraffic() + 1);
        return ResponseEntity.ok(sponsorBoothRepository.save(booth));
    }

    @PutMapping("/booths/leads/{boothId}")
    public ResponseEntity<SponsorBooth> incrementLeads(@PathVariable Long boothId) {
        SponsorBooth booth = sponsorBoothRepository.findById(boothId)
                .orElseThrow(() -> new RuntimeException("Booth not found"));
        booth.setLeadCount(booth.getLeadCount() + 1);
        return ResponseEntity.ok(sponsorBoothRepository.save(booth));
    }
}
