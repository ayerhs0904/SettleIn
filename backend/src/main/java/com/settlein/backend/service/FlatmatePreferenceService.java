package com.settlein.backend.service;

import com.settlein.backend.dto.FlatmatePreferenceRequest;
import com.settlein.backend.dto.FlatmatePreferenceResponse;
import com.settlein.backend.entity.FlatmatePreference;
import com.settlein.backend.entity.User;
import com.settlein.backend.repository.FlatmatePreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlatmatePreferenceService {

    private final FlatmatePreferenceRepository preferenceRepository;
    private final EmbeddingService embeddingService;

    public FlatmatePreferenceResponse saveOrUpdatePreference(FlatmatePreferenceRequest request, User currentUser) {
        log.info("Saving flatmate preferences for user ID {}", currentUser.getId());

        FlatmatePreference preference = preferenceRepository.findByUserId(currentUser.getId())
                .orElse(FlatmatePreference.builder().user(currentUser).build());

        preference.setSleepSchedule(request.getSleepSchedule());
        preference.setCookingHabit(request.getCookingHabit());
        preference.setCleanliness(request.getCleanliness());
        preference.setWorkSchedule(request.getWorkSchedule());
        preference.setDietaryPreference(request.getDietaryPreference());
        preference.setSmokingDrinking(request.getSmokingDrinking());
        preference.setGuestsFrequency(request.getGuestsFrequency());
        preference.setBudget(request.getBudget());
        preference.setPreferredArea(request.getPreferredArea());
        preference.setAboutMe(request.getAboutMe());

        // Construct narrative for vector embedding
        String profileText = String.format(
                "User %s preferences: Sleep schedule is %s. Cooking habit: %s. Cleanliness level: %s. Work schedule: %s. Dietary preference: %s. Smoking/Drinking: %s. Guest frequency: %s. Budget: %s. Preferred Area: %s. About Me: %s",
                currentUser.getName(),
                request.getSleepSchedule(),
                request.getCookingHabit(),
                request.getCleanliness(),
                request.getWorkSchedule(),
                request.getDietaryPreference(),
                request.getSmokingDrinking(),
                request.getGuestsFrequency(),
                request.getBudget(),
                request.getPreferredArea(),
                request.getAboutMe()
        );

        float[] embedding = embeddingService.generateEmbedding(profileText);
        preference.setEmbedding(embedding);

        FlatmatePreference saved = preferenceRepository.save(preference);
        return mapToResponse(saved);
    }

    public FlatmatePreferenceResponse getPreferenceByUser(User currentUser) {
        return preferenceRepository.findByUserId(currentUser.getId())
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No preferences found for user"));
    }

    private FlatmatePreferenceResponse mapToResponse(FlatmatePreference pref) {
        float[] emb = pref.getEmbedding();
        return FlatmatePreferenceResponse.builder()
                .id(pref.getId())
                .userId(pref.getUser().getId())
                .userName(pref.getUser().getName())
                .userEmail(pref.getUser().getEmail())
                .sleepSchedule(pref.getSleepSchedule())
                .cookingHabit(pref.getCookingHabit())
                .cleanliness(pref.getCleanliness())
                .workSchedule(pref.getWorkSchedule())
                .dietaryPreference(pref.getDietaryPreference())
                .smokingDrinking(pref.getSmokingDrinking())
                .guestsFrequency(pref.getGuestsFrequency())
                .budget(pref.getBudget())
                .preferredArea(pref.getPreferredArea())
                .aboutMe(pref.getAboutMe())
                .hasEmbedding(emb != null && emb.length > 0)
                .embeddingDimension(emb != null ? emb.length : 0)
                .build();
    }
}
