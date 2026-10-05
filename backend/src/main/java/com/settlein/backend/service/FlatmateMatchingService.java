package com.settlein.backend.service;

import com.settlein.backend.dto.*;
import com.settlein.backend.entity.*;
import com.settlein.backend.repository.FlatmateInteractionRepository;
import com.settlein.backend.repository.FlatmatePreferenceRepository;
import com.settlein.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlatmateMatchingService {

    private final FlatmatePreferenceRepository preferenceRepository;
    private final FlatmateInteractionRepository interactionRepository;
    private final UserRepository userRepository;

    public List<FlatmateMatchResponse> findTopMatches(User currentUser, int topN) {
        log.info("Computing top {} flatmate matches for user ID {}", topN, currentUser.getId());

        FlatmatePreference targetPref = preferenceRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Please complete your roommate preferences profile first before searching for matches."
                ));

        List<Long> interactedUserIds = interactionRepository.findInteractedUserIdsByFromUser(currentUser);

        List<FlatmatePreference> allPreferences = preferenceRepository.findAll();

        List<MatchCandidate> candidates = new ArrayList<>();

        for (FlatmatePreference candidatePref : allPreferences) {
            Long candidateUserId = candidatePref.getUser().getId();
            if (candidateUserId.equals(currentUser.getId())) {
                continue; // Skip self
            }
            if (interactedUserIds.contains(candidateUserId)) {
                continue; // Skip already interacted candidates
            }

            double similarity = calculateCosineSimilarity(targetPref.getEmbedding(), candidatePref.getEmbedding());
            double percentageScore = Math.min(99.0, Math.max(60.0, Math.round((similarity + 1.0) / 2.0 * 100.0 * 10.0) / 10.0));

            candidates.add(new MatchCandidate(candidatePref, percentageScore));
        }

        return candidates.stream()
                .sorted(Comparator.comparingDouble(MatchCandidate::getScore).reversed())
                .limit(topN)
                .map(cand -> {
                    String summary = generateCompatibilitySummary(targetPref, cand.getPreference(), cand.getScore());
                    return FlatmateMatchResponse.builder()
                            .matchUserId(cand.getPreference().getUser().getId())
                            .matchUserName(cand.getPreference().getUser().getName())
                            .matchUserEmail(cand.getPreference().getUser().getEmail())
                            .compatibilityScore(cand.getScore())
                            .compatibilitySummary(summary)
                            .preference(mapToResponse(cand.getPreference()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public FlatmateInteractionResponse recordInteraction(User currentUser, FlatmateInteractionRequest request) {
        if (request.getTargetUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot interact with your own profile.");
        }

        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found."));

        Optional<FlatmateInteraction> existingOpt = interactionRepository.findByFromUserAndToUser(currentUser, targetUser);
        FlatmateInteraction interaction;
        if (existingOpt.isPresent()) {
            interaction = existingOpt.get();
            interaction.setStatus(request.getAction());
        } else {
            interaction = FlatmateInteraction.builder()
                    .fromUser(currentUser)
                    .toUser(targetUser)
                    .status(request.getAction())
                    .createdAt(LocalDateTime.now())
                    .build();
        }
        interactionRepository.save(interaction);

        boolean isMutual = false;
        if (request.getAction() == InteractionStatus.INTERESTED) {
            Optional<FlatmateInteraction> reverseOpt = interactionRepository.findByFromUserAndToUser(targetUser, currentUser);
            if (reverseOpt.isPresent() && reverseOpt.get().getStatus() == InteractionStatus.INTERESTED) {
                isMutual = true;
            }
        }

        String message = isMutual
                ? "It's a mutual match! You both expressed interest in each other."
                : (request.getAction() == InteractionStatus.INTERESTED ? "Expressed interest in " + targetUser.getName() : "Skipped " + targetUser.getName());

        return FlatmateInteractionResponse.builder()
                .mutualMatch(isMutual)
                .message(message)
                .build();
    }

    public FlatmateInterestGroupResponse getInterestsGroup(User currentUser) {
        FlatmatePreference targetPref = preferenceRepository.findByUserId(currentUser.getId()).orElse(null);

        // 1. Mutual Matches
        List<FlatmateInteraction> mutualInteractions = interactionRepository.findMutualInterests(currentUser);
        List<FlatmateMatchResponse> mutualMatches = mutualInteractions.stream()
                .map(i -> buildMatchResponse(targetPref, i.getToUser()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 2. Sent Interests (where current user expressed INTERESTED, excluding mutual matches)
        Set<Long> mutualUserIds = mutualMatches.stream().map(FlatmateMatchResponse::getMatchUserId).collect(Collectors.toSet());
        List<FlatmateInteraction> sentInteractions = interactionRepository.findByFromUserAndStatus(currentUser, InteractionStatus.INTERESTED);
        List<FlatmateMatchResponse> sentInterests = sentInteractions.stream()
                .filter(i -> !mutualUserIds.contains(i.getToUser().getId()))
                .map(i -> buildMatchResponse(targetPref, i.getToUser()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 3. Received Interests (where others expressed INTERESTED in current user, excluding mutual matches & skipped)
        List<FlatmateInteraction> receivedInteractions = interactionRepository.findByToUserAndStatus(currentUser, InteractionStatus.INTERESTED);
        List<Long> skippedUserIds = interactionRepository.findByFromUserAndStatus(currentUser, InteractionStatus.SKIPPED)
                .stream().map(i -> i.getToUser().getId()).collect(Collectors.toList());

        List<FlatmateMatchResponse> receivedInterests = receivedInteractions.stream()
                .filter(i -> !mutualUserIds.contains(i.getFromUser().getId()) && !skippedUserIds.contains(i.getFromUser().getId()))
                .map(i -> buildMatchResponse(targetPref, i.getFromUser()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return FlatmateInterestGroupResponse.builder()
                .mutualMatches(mutualMatches)
                .sentInterests(sentInterests)
                .receivedInterests(receivedInterests)
                .build();
    }

    private FlatmateMatchResponse buildMatchResponse(FlatmatePreference targetPref, User otherUser) {
        Optional<FlatmatePreference> otherPrefOpt = preferenceRepository.findByUserId(otherUser.getId());
        if (otherPrefOpt.isEmpty()) {
            return FlatmateMatchResponse.builder()
                    .matchUserId(otherUser.getId())
                    .matchUserName(otherUser.getName())
                    .matchUserEmail(otherUser.getEmail())
                    .compatibilityScore(75.0)
                    .compatibilitySummary(otherUser.getName() + " has expressed interest in finding a roommate.")
                    .preference(null)
                    .build();
        }

        FlatmatePreference otherPref = otherPrefOpt.get();
        double score = 75.0;
        String summary = otherUser.getName() + " is looking for a roommate.";

        if (targetPref != null) {
            double similarity = calculateCosineSimilarity(targetPref.getEmbedding(), otherPref.getEmbedding());
            score = Math.min(99.0, Math.max(60.0, Math.round((similarity + 1.0) / 2.0 * 100.0 * 10.0) / 10.0));
            summary = generateCompatibilitySummary(targetPref, otherPref, score);
        }

        return FlatmateMatchResponse.builder()
                .matchUserId(otherUser.getId())
                .matchUserName(otherUser.getName())
                .matchUserEmail(otherUser.getEmail())
                .compatibilityScore(score)
                .compatibilitySummary(summary)
                .preference(mapToResponse(otherPref))
                .build();
    }

    private double calculateCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length == 0 || vectorB.length == 0 || vectorA.length != vectorB.length) {
            return 0.5; // Neutral baseline if embeddings missing
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0 || normB == 0) {
            return 0.5;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private String generateCompatibilitySummary(FlatmatePreference target, FlatmatePreference candidate, double score) {
        String name = candidate.getUser().getName();
        List<String> highlights = new ArrayList<>();

        // Sleep Schedule
        if (target.getSleepSchedule() != null && target.getSleepSchedule().equalsIgnoreCase(candidate.getSleepSchedule())) {
            highlights.add("shared " + target.getSleepSchedule().split("\\(")[0].trim() + " sleep routine");
        }

        // Dietary Preference
        if (target.getDietaryPreference() != null && target.getDietaryPreference().equalsIgnoreCase(candidate.getDietaryPreference())) {
            highlights.add("matching " + target.getDietaryPreference() + " dietary habits");
        }

        // Cleanliness
        if (target.getCleanliness() != null && target.getCleanliness().equalsIgnoreCase(candidate.getCleanliness())) {
            highlights.add("similar " + target.getCleanliness().toLowerCase() + " standards");
        }

        // Work Schedule
        if (target.getWorkSchedule() != null && target.getWorkSchedule().equalsIgnoreCase(candidate.getWorkSchedule())) {
            highlights.add("compatible " + target.getWorkSchedule() + " work timing");
        }

        StringBuilder sb = new StringBuilder();
        sb.append(name).append(" and you have a ").append((int) score).append("% lifestyle compatibility! ");

        if (!highlights.isEmpty()) {
            sb.append("You share a ").append(String.join(", ", highlights)).append(". ");
        } else {
            sb.append("Your lifestyle choices and daily routines complement each other well. ");
        }

        if (candidate.getPreferredArea() != null && !candidate.getPreferredArea().isEmpty()) {
            sb.append(name).append(" is looking for housing in ").append(candidate.getPreferredArea()).append(".");
        } else {
            sb.append("Both of your roommate preference profiles show high alignment.");
        }

        return sb.toString();
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

    private static class MatchCandidate {
        private final FlatmatePreference preference;
        private final double score;

        public MatchCandidate(FlatmatePreference preference, double score) {
            this.preference = preference;
            this.score = score;
        }

        public FlatmatePreference getPreference() {
            return preference;
        }

        public double getScore() {
            return score;
        }
    }
}
