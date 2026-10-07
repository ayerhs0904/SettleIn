package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TiffinProviderResponse {
    private Long id;
    private String name;
    private String cuisineType;
    private List<String> dietaryOptions;
    private Double pricePerMonth;
    private String area;
    private String city;
    private String description;
    private String contactPhone;
    private String imageUrl;
    private Long ownerId;
    private String ownerName;

    // Rating & Recommendation details
    private double averageRating;
    private int reviewCount;
    private List<TiffinReviewResponse> reviews;
    
    private double recommendationScore; // e.g. 96.5%
    private String recommendationReason; // AI rationale (e.g. "Matching Pure Veg diet in Sector 62 with 4.8★ rating")
}
