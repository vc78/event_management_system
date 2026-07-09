package com.ems.event_management_system.service;

import com.ems.event_management_system.dto.request.VenueRequest;
import com.ems.event_management_system.dto.response.VenueResponse;

import java.util.List;

public interface VenueService {
    VenueResponse createVenue(VenueRequest request);
    List<VenueResponse> getAllVenues();
    VenueResponse getVenueById(Long id);
    VenueResponse updateVenue(Long id, VenueRequest request);
    void deleteVenue(Long id);
}