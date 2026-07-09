package com.ems.event_management_system.controller;

import com.ems.event_management_system.dto.request.VenueRequest;
import com.ems.event_management_system.dto.response.ApiResponse;
import com.ems.event_management_system.dto.response.VenueResponse;
import com.ems.event_management_system.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody VenueRequest request) {
        return new ResponseEntity<>(venueService.createVenue(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(@PathVariable Long id,
                                                     @Valid @RequestBody VenueRequest request) {
        return ResponseEntity.ok(venueService.updateVenue(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok(new ApiResponse(true, "Venue deleted successfully"));
    }
}