package com.ems.event_management_system.service.impl;

import com.ems.event_management_system.dto.request.VenueRequest;
import com.ems.event_management_system.dto.response.VenueResponse;
import com.ems.event_management_system.entity.Venue;
import com.ems.event_management_system.exception.ResourceNotFoundException;
import com.ems.event_management_system.repository.VenueRepository;
import com.ems.event_management_system.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;

    @Override
    public VenueResponse createVenue(VenueRequest request) {
        Venue venue = Venue.builder()
                .venueName(request.getVenueName())
                .address(request.getAddress())
                .city(request.getCity())
                .stateName(request.getStateName())
                .country(request.getCountry())
                .capacity(request.getCapacity())
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .build();

        Venue saved = venueRepository.save(venue);
        return mapToResponse(saved);
    }

    @Override
    public List<VenueResponse> getAllVenues() {
        return venueRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public VenueResponse getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
        return mapToResponse(venue);
    }

    @Override
    public VenueResponse updateVenue(Long id, VenueRequest request) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));

        venue.setVenueName(request.getVenueName());
        venue.setAddress(request.getAddress());
        venue.setCity(request.getCity());
        venue.setStateName(request.getStateName());
        venue.setCountry(request.getCountry());
        venue.setCapacity(request.getCapacity());
        venue.setContactPerson(request.getContactPerson());
        venue.setContactPhone(request.getContactPhone());

        Venue updated = venueRepository.save(venue);
        return mapToResponse(updated);
    }

    @Override
    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
        venueRepository.delete(venue);
    }

    private VenueResponse mapToResponse(Venue venue) {
        return VenueResponse.builder()
                .id(venue.getId())
                .venueName(venue.getVenueName())
                .address(venue.getAddress())
                .city(venue.getCity())
                .stateName(venue.getStateName())
                .country(venue.getCountry())
                .capacity(venue.getCapacity())
                .contactPerson(venue.getContactPerson())
                .contactPhone(venue.getContactPhone())
                .build();
    }
}