package com.settlein.backend.service;

import com.settlein.backend.dto.*;
import com.settlein.backend.entity.*;
import com.settlein.backend.repository.FlatmatePreferenceRepository;
import com.settlein.backend.repository.TiffinProviderRepository;
import com.settlein.backend.repository.TiffinReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TiffinService {

    private final TiffinProviderRepository providerRepository;
    private final TiffinReviewRepository reviewRepository;
    private final FlatmatePreferenceRepository preferenceRepository;
    private final SentimentAnalysisService sentimentAnalysisService;

    @Transactional
    public TiffinProviderResponse createProvider(TiffinProviderRequest request, User owner) {
        TiffinProvider provider = TiffinProvider.builder()
                .name(request.getName())
                .cuisineType(request.getCuisineType())
                .dietaryOptions(request.getDietaryOptions() != null ? request.getDietaryOptions() : new ArrayList<>())
                .pricePerMonth(request.getPricePerMonth())
                .area(request.getArea())
                .city(request.getCity())
                .description(request.getDescription())
                .contactPhone(request.getContactPhone())
                .imageUrl(request.getImageUrl())
                .owner(owner)
                .build();

        TiffinProvider saved = providerRepository.save(provider);
        return mapToResponse(saved, true);
    }

    public List<TiffinProviderResponse> getAllProviders(String area, String city, Double maxPrice) {
        List<TiffinProvider> providers = providerRepository.filterProviders(area, city, maxPrice);
        return providers.stream()
                .map(p -> mapToResponse(p, false))
                .collect(Collectors.toList());
    }

    public TiffinProviderResponse getProviderById(Long id) {
        TiffinProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tiffin provider not found"));
        return mapToResponse(provider, true);
    }

    @Transactional
    public TiffinProviderResponse updateProvider(Long id, TiffinProviderRequest request, User currentUser) {
        TiffinProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tiffin provider not found"));

        if (!provider.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the service owner can edit this tiffin provider");
        }

        provider.setName(request.getName());
        provider.setCuisineType(request.getCuisineType());
        if (request.getDietaryOptions() != null) provider.setDietaryOptions(request.getDietaryOptions());
        provider.setPricePerMonth(request.getPricePerMonth());
        provider.setArea(request.getArea());
        provider.setCity(request.getCity());
        provider.setDescription(request.getDescription());
        provider.setContactPhone(request.getContactPhone());
        provider.setImageUrl(request.getImageUrl());

        TiffinProvider updated = providerRepository.save(provider);
        return mapToResponse(updated, true);
    }

    @Transactional
    public void deleteProvider(Long id, User currentUser) {
        TiffinProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tiffin provider not found"));

        if (!provider.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the service owner can delete this tiffin provider");
        }

        providerRepository.delete(provider);
    }

    // --- REVIEW METHODS ---

    @Transactional
    public TiffinReviewResponse addReview(Long providerId, TiffinReviewRequest request, User user) {
        TiffinProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tiffin provider not found"));

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5 stars");
        }

        // Evaluate sentiment classification
        SentimentAnalysisService.SentimentResult sentimentRes =
                sentimentAnalysisService.analyzeSentiment(request.getComment(), request.getRating());

        TiffinReview review = TiffinReview.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .sentiment(sentimentRes.getSentiment())
                .sentimentScore(sentimentRes.getSentimentScore())
                .provider(provider)
                .user(user)
                .build();

        TiffinReview saved = reviewRepository.save(review);

        return TiffinReviewResponse.builder()
                .id(saved.getId())
                .rating(saved.getRating())
                .comment(saved.getComment())
                .sentiment(saved.getSentiment())
                .sentimentScore(saved.getSentimentScore())
                .userId(user.getId())
                .userName(user.getName())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<TiffinReviewResponse> getProviderReviews(Long providerId) {
        return reviewRepository.findByProviderIdOrderByCreatedAtDesc(providerId).stream()
                .map(r -> {
                    String sentiment = r.getSentiment();
                    Double score = r.getSentimentScore();
                    if (sentiment == null) {
                        SentimentAnalysisService.SentimentResult sr = sentimentAnalysisService.analyzeSentiment(r.getComment(), r.getRating());
                        sentiment = sr.getSentiment();
                        score = sr.getSentimentScore();
                    }
                    return TiffinReviewResponse.builder()
                            .id(r.getId())
                            .rating(r.getRating())
                            .comment(r.getComment())
                            .sentiment(sentiment)
                            .sentimentScore(score)
                            .userId(r.getUser().getId())
                            .userName(r.getUser().getName())
                            .createdAt(r.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // --- RECOMMENDATION ENGINE WITH SENTIMENT WEIGHT ---

    public List<TiffinProviderResponse> getRecommendations(User currentUser) {
        FlatmatePreference userPref = preferenceRepository.findByUserId(currentUser.getId()).orElse(null);
        List<TiffinProvider> allProviders = providerRepository.findAll();

        String targetDiet = (userPref != null && userPref.getDietaryPreference() != null) ? userPref.getDietaryPreference() : "";
        String targetArea = (userPref != null && userPref.getPreferredArea() != null) ? userPref.getPreferredArea() : "";

        List<TiffinProviderResponse> ranked = new ArrayList<>();

        for (TiffinProvider provider : allProviders) {
            TiffinProviderResponse response = mapToResponse(provider, false);

            double score = 65.0; // Baseline score
            List<String> rationale = new ArrayList<>();

            // 1. Dietary Option Alignment
            boolean dietMatch = false;
            if (!targetDiet.isEmpty()) {
                for (String option : provider.getDietaryOptions()) {
                    if (option.equalsIgnoreCase(targetDiet) || targetDiet.toLowerCase().contains(option.toLowerCase())) {
                        dietMatch = true;
                        break;
                    }
                }
                if (dietMatch) {
                    score += 20.0;
                    rationale.add("Offers matching " + targetDiet + " diet");
                }
            }

            // 2. Preferred Area Proximity
            if (!targetArea.isEmpty() && provider.getArea() != null &&
                (provider.getArea().toLowerCase().contains(targetArea.toLowerCase()) || targetArea.toLowerCase().contains(provider.getArea().toLowerCase()))) {
                score += 15.0;
                rationale.add("Located in/near preferred area (" + provider.getArea() + ")");
            }

            // 3. Rating & Sentiment Boost
            if (response.getAverageRating() > 0) {
                double ratingBoost = (response.getAverageRating() / 5.0) * 10.0;
                score += ratingBoost;
                rationale.add(String.format(Locale.US, "High rating of %.1f★ (%d reviews)", response.getAverageRating(), response.getReviewCount()));
            }

            if (response.getPositiveSentimentPercentage() > 0) {
                double sentimentBoost = (response.getPositiveSentimentPercentage() / 100.0) * 10.0;
                score += sentimentBoost;
                if (response.getPositiveSentimentPercentage() >= 75.0) {
                    rationale.add(String.format(Locale.US, "%.0f%% Positive customer sentiment", response.getPositiveSentimentPercentage()));
                }
            }

            double finalScore = Math.min(99.0, Math.max(50.0, Math.round(score * 10.0) / 10.0));
            response.setRecommendationScore(finalScore);
            response.setRecommendationReason(rationale.isEmpty() ? "Popular local tiffin provider" : String.join(" • ", rationale));

            ranked.add(response);
        }

        // Sort by recommendation score descending
        ranked.sort(Comparator.comparingDouble(TiffinProviderResponse::getRecommendationScore).reversed());

        // Mark the top candidate as Best Match
        if (!ranked.isEmpty()) {
            ranked.get(0).setBestMatch(true);
        }

        return ranked;
    }

    // --- HELPER MAPPER ---

    private TiffinProviderResponse mapToResponse(TiffinProvider provider, boolean includeReviews) {
        List<TiffinReview> reviews = provider.getReviews() != null ? provider.getReviews() : new ArrayList<>();
        double avgRating = reviews.isEmpty() ? 0.0 : reviews.stream().mapToInt(TiffinReview::getRating).average().orElse(0.0);
        avgRating = Math.round(avgRating * 10.0) / 10.0;

        // Calculate positive sentiment percentage
        long positiveCount = reviews.stream().filter(r -> {
            String s = r.getSentiment();
            if (s == null) {
                s = sentimentAnalysisService.analyzeSentiment(r.getComment(), r.getRating()).getSentiment();
            }
            return "POSITIVE".equals(s);
        }).count();

        double positiveSentimentPct = reviews.isEmpty() ? 0.0 : Math.round((double) positiveCount / reviews.size() * 100.0 * 10.0) / 10.0;

        List<TiffinReviewResponse> reviewResponses = null;
        if (includeReviews) {
            reviewResponses = reviews.stream()
                    .map(r -> {
                        String sentiment = r.getSentiment();
                        Double score = r.getSentimentScore();
                        if (sentiment == null) {
                            SentimentAnalysisService.SentimentResult sr = sentimentAnalysisService.analyzeSentiment(r.getComment(), r.getRating());
                            sentiment = sr.getSentiment();
                            score = sr.getSentimentScore();
                        }
                        return TiffinReviewResponse.builder()
                                .id(r.getId())
                                .rating(r.getRating())
                                .comment(r.getComment())
                                .sentiment(sentiment)
                                .sentimentScore(score)
                                .userId(r.getUser().getId())
                                .userName(r.getUser().getName())
                                .createdAt(r.getCreatedAt())
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return TiffinProviderResponse.builder()
                .id(provider.getId())
                .name(provider.getName())
                .cuisineType(provider.getCuisineType())
                .dietaryOptions(provider.getDietaryOptions())
                .pricePerMonth(provider.getPricePerMonth())
                .area(provider.getArea())
                .city(provider.getCity())
                .description(provider.getDescription())
                .contactPhone(provider.getContactPhone())
                .imageUrl(provider.getImageUrl())
                .ownerId(provider.getOwner().getId())
                .ownerName(provider.getOwner().getName())
                .averageRating(avgRating)
                .reviewCount(reviews.size())
                .positiveSentimentPercentage(positiveSentimentPct)
                .reviews(reviewResponses)
                .build();
    }
}
