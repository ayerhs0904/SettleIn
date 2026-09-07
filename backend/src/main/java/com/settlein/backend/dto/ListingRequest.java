package com.settlein.backend.dto;

import com.settlein.backend.entity.ListingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ListingRequest {
    private String title;
    private String description;
    private Double rent;
    private String location;
    private String city;
    private ListingType listingType;
    private List<String> amenities;
    private List<String> images;
}
