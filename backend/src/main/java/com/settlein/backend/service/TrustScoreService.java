package com.settlein.backend.service;

import com.settlein.backend.entity.Listing;
import com.settlein.backend.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrustScoreService {

    private final ListingRepository listingRepository;

    private static final List<String> SPAM_PHRASES = Arrays.asList(
            "contact me fast",
            "whatsapp only",
            "cheap deal",
            "send advance",
            "urgent transfer",
            "bank transfer first",
            "call immediately",
            "no broker call fast",
            "free deposit"
    );

    public void evaluateTrustScore(Listing listing) {
        int score = 100;
        List<String> flags = new ArrayList<>();

        // --- Heuristic 1: Rent Outlier Analysis ---
        Double avgRent = (listing.getId() != null)
                ? listingRepository.findAverageRentByCityExcludingId(listing.getCity(), listing.getId())
                : listingRepository.findAverageRentByCity(listing.getCity());

        if (listing.getRent() != null) {
            if (listing.getRent() < 1000) {
                score -= 40;
                flags.add("🚨 Suspiciously low rent under ₹1,000/month");
            } else if (avgRent != null && avgRent > 0) {
                double ratio = listing.getRent() / avgRent;
                if (ratio < 0.5) { // Rent is < 50% of city average
                    score -= 30;
                    flags.add(String.format(Locale.US, "⚠️ Rent (₹%.0f) is an extreme outlier (%.0f%% below city average of ₹%.0f)",
                            listing.getRent(), (1.0 - ratio) * 100, avgRent));
                } else if (ratio > 2.5) { // Rent is > 250% of city average
                    score -= 15;
                    flags.add(String.format(Locale.US, "⚠️ Rent (₹%.0f) is significantly above the city average of ₹%.0f",
                            listing.getRent(), avgRent));
                }
            }
        }

        // --- Heuristic 2: Duplicate Image Hashes / URLs Analysis ---
        if (listing.getImages() != null && !listing.getImages().isEmpty() && listing.getOwner() != null) {
            List<Listing> duplicateListings = listingRepository.findListingsWithDuplicateImages(
                    listing.getImages(), listing.getOwner().getId()
            );

            if (!duplicateListings.isEmpty()) {
                score -= 35;
                flags.add("🚨 Duplicate image URLs detected across listings from another account");
            }
        }

        // --- Heuristic 3: Suspicious Description Analysis ---
        String desc = listing.getDescription();
        if (desc == null || desc.trim().length() < 30) {
            score -= 25;
            flags.add("⚠️ Description is suspiciously brief (less than 30 characters)");
        } else {
            String lowerDesc = desc.toLowerCase(Locale.US);
            for (String spamPhrase : SPAM_PHRASES) {
                if (lowerDesc.contains(spamPhrase)) {
                    score -= 30;
                    flags.add("🚨 Description contains generic spam phrasing: \"" + spamPhrase + "\"");
                    break;
                }
            }
        }

        // --- Quality Boost for Verified Completeness ---
        if (flags.isEmpty() && desc != null && desc.length() >= 100 && listing.getImages() != null && listing.getImages().size() >= 2) {
            flags.add("✅ Detailed property description and verified photos provided");
        }

        // Clamp score between 0 and 100
        int finalScore = Math.max(0, Math.min(100, score));
        String badge;
        if (finalScore >= 80 && !hasCriticalSpamFlag(flags)) {
            badge = "VERIFIED";
        } else if (finalScore >= 50) {
            badge = "CAUTION";
        } else {
            badge = "UNVERIFIED";
        }

        listing.setTrustScore(finalScore);
        listing.setTrustBadge(badge);
        listing.setTrustFlags(flags);

        log.info("Evaluated trust score for listing '{}': score={}, badge={}, flags={}",
                listing.getTitle(), finalScore, badge, flags);
    }

    private boolean hasCriticalSpamFlag(List<String> flags) {
        return flags.stream().anyMatch(f -> f.startsWith("🚨"));
    }
}
