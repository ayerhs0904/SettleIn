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
public class TiffinProviderRequest {
    private String name;
    private String cuisineType;
    private List<String> dietaryOptions;
    private Double pricePerMonth;
    private String area;
    private String city;
    private String description;
    private String contactPhone;
    private String imageUrl;
}
