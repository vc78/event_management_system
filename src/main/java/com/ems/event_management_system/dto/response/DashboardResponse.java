package com.ems.event_management_system.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponse {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private long totalCategories;
    private long totalVenues;
    private BigDecimal totalRevenue;
    private long confirmedBookings;
    private long cancelledBookings;
}