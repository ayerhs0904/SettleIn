package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FlatmateMatchResponse {
    private Long matchUserId;
    private String matchUserName;
    private String matchUserEmail;
    private double compatibilityScore; // Percentage match e.g. 94.5
    private String compatibilitySummary; // 2-3 sentence AI summary
    private FlatmatePreferenceResponse preference; // Full preference details of the candidate match
}
