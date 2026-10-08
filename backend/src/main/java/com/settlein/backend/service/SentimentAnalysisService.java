package com.settlein.backend.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class SentimentAnalysisService {

    private static final List<String> POSITIVE_KEYWORDS = Arrays.asList(
            "delicious", "tasty", "fresh", "hygienic", "great", "awesome", "good",
            "excellent", "amazing", "loved", "perfect", "clean", "best", "punctual",
            "timely", "recommend", "homely", "healthy", "flavorful", "yummy", "fast"
    );

    private static final List<String> NEGATIVE_KEYWORDS = Arrays.asList(
            "terrible", "bad", "stale", "unhygienic", "late", "cold", "salty",
            "worst", "horrible", "disappointed", "dirty", "tasteless", "avoid",
            "raw", "poor", "overpriced", "oily", "spoiled", "delay"
    );

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SentimentResult {
        private String sentiment; // POSITIVE, NEUTRAL, NEGATIVE
        private double sentimentScore; // +1.0, 0.0, -1.0
    }

    public SentimentResult analyzeSentiment(String comment, Integer rating) {
        if (comment == null) comment = "";
        String text = comment.toLowerCase(Locale.US);

        int positiveCount = 0;
        int negativeCount = 0;

        for (String word : POSITIVE_KEYWORDS) {
            if (text.contains(word)) positiveCount++;
        }

        for (String word : NEGATIVE_KEYWORDS) {
            if (text.contains(word)) negativeCount++;
        }

        // Combine keyword count with star rating
        int starWeight = (rating != null) ? (rating >= 4 ? 2 : (rating <= 2 ? -2 : 0)) : 0;
        int netScore = (positiveCount - negativeCount) + starWeight;

        if (netScore > 0) {
            return new SentimentResult("POSITIVE", 1.0);
        } else if (netScore < 0) {
            return new SentimentResult("NEGATIVE", -1.0);
        } else {
            return new SentimentResult("NEUTRAL", 0.0);
        }
    }
}
