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

    // Sentiment breakdown stats
    private double positiveSentimentPercentage; // e.g. 92.5%

    // AI Recommendation & Best Match badge details
    private double recommendationScore; // e.g. 96.5%
    private String recommendationReason; // AI rationale
    private boolean bestMatch; // True for top recommended provider
}
