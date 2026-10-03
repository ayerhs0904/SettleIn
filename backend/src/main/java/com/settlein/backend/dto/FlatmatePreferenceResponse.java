package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FlatmatePreferenceResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String sleepSchedule;
    private String cookingHabit;
    private String cleanliness;
    private String workSchedule;
    private String dietaryPreference;
    private String smokingDrinking;
    private String guestsFrequency;
    private Double budget;
    private String preferredArea;
    private String aboutMe;
    private boolean hasEmbedding;
    private int embeddingDimension;
}
