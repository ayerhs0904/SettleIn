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
public class AiParsedFilters {
    private String city;
    private String location;
    private ListingType listingType;
    private Double minRent;
    private Double maxRent;
    private List<String> amenities;
    private String summary;
}
