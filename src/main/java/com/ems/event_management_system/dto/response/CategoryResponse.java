package com.ems.event_management_system.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String categoryName;
    private String description;
}