package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiSearchResponse {
    private String summary;
    private AiParsedFilters parsedFilters;
    private Page<ListingResponse> listings;
}
