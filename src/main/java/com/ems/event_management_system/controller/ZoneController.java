package com.ems.event_management_system.controller;

import com.ems.event_management_system.entity.Zone;
import com.ems.event_management_system.entity.ZoneTrafficEvent;
import com.ems.event_management_system.entity.Lead;
import com.ems.event_management_system.repository.ZoneRepository;
import com.ems.event_management_system.repository.ZoneTrafficEventRepository;
import com.ems.event_management_system.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ZoneController {

    private final ZoneRepository zoneRepository;
    private final ZoneTrafficEventRepository zoneTrafficEventRepository;
    private final LeadRepository leadRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<Zone>> getZones() {
        return ResponseEntity.ok(zoneRepository.findAll());
    }

    @GetMapping("/{zoneId}/history")
    public ResponseEntity<List<ZoneTrafficEvent>> getZoneHistory(@PathVariable String zoneId) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        return ResponseEntity.ok(zoneTrafficEventRepository.findByZoneIdAndTimestampAfterOrderByTimestampAsc(zoneId, oneHourAgo));
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> simulateEvent(@RequestBody Map<String, Object> payload) {
        String zoneId = (String) payload.get("zoneId");
        String type = (String) payload.get("type"); // "dwell" or "nfc"
        
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new RuntimeException("Zone not found"));

        if ("dwell".equalsIgnoreCase(type)) {
            // Simulate visitor dwell (increases visitors/dwell times)
            int newVisitors = (int) (Math.random() * 5) + 1;
            int dwellSeconds = (int) (Math.random() * 300) + 60;
            
            zone.setCurrentVisitorCount(zone.getCurrentVisitorCount() + newVisitors);
            zone.setTotalDwellSeconds(zone.getTotalDwellSeconds() + dwellSeconds);
            zoneRepository.save(zone);

            // Log event
            ZoneTrafficEvent trafficEvent = ZoneTrafficEvent.builder()
                    .zoneId(zoneId)
                    .visitorCount(zone.getCurrentVisitorCount())
                    .dwellSeconds(dwellSeconds)
                    .timestamp(LocalDateTime.now())
                    .build();
            zoneTrafficEventRepository.save(trafficEvent);

        } else if ("nfc".equalsIgnoreCase(type)) {
            // NFC Tap (requires attendeeId, sponsorId, and consent check)
            Long attendeeId = Long.valueOf(payload.get("attendeeId").toString());
            Long sponsorId = Long.valueOf(payload.get("sponsorId").toString());
            Boolean consent = (Boolean) payload.get("consentGiven");

            // GDPR Check
            if (consent == null || !consent) {
                return ResponseEntity.badRequest().body(Map.of("message", "GDPR consent required for lead generation."));
            }

            // Save lead
            Lead lead = Lead.builder()
                    .sponsorId(sponsorId)
                    .attendeeId(attendeeId)
                    .consentGiven(true)
                    .capturedAt(LocalDateTime.now())
                    .build();
            leadRepository.save(lead);

            // Also increment visitor count slightly
            zone.setCurrentVisitorCount(zone.getCurrentVisitorCount() + 1);
            zone.setTotalDwellSeconds(zone.getTotalDwellSeconds() + 120);
            zoneRepository.save(zone);

            ZoneTrafficEvent trafficEvent = ZoneTrafficEvent.builder()
                    .zoneId(zoneId)
                    .visitorCount(zone.getCurrentVisitorCount())
                    .dwellSeconds(120)
                    .timestamp(LocalDateTime.now())
                    .build();
            zoneTrafficEventRepository.save(trafficEvent);
        }

        // Broadcast update to all listeners
        messagingTemplate.convertAndSend("/topic/venue-map/traffic", zoneRepository.findAll());

        return ResponseEntity.ok(zone);
    }
}
