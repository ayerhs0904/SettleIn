package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CityAnalyticsResponse {
    private String city;
    private long totalListings;
    private double averageRent;
    private double minRent;
    private double maxRent;
}
