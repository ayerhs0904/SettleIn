package com.settlein.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.settlein.backend.dto.AiParsedFilters;
import com.settlein.backend.dto.AiSearchResponse;
import com.settlein.backend.dto.ListingResponse;
import com.settlein.backend.entity.Listing;
import com.settlein.backend.entity.ListingType;
import com.settlein.backend.repository.ListingRepository;
import com.settlein.backend.repository.ListingSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiSearchService {

    private final ListingRepository listingRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiSearchResponse searchWithAi(String userQuery, Pageable pageable) {
        if (userQuery == null || userQuery.trim().isEmpty()) {
            return AiSearchResponse.builder()
                    .summary("Please provide a search prompt.")
                    .parsedFilters(new AiParsedFilters())
                    .listings(Page.empty())
                    .build();
        }

        log.info("Processing AI search query: '{}'", userQuery);

        AiParsedFilters filters = parsePromptToFilters(userQuery);

        var spec = ListingSpecification.filterListings(
                filters.getCity(),
                filters.getListingType(),
                filters.getMinRent(),
                filters.getMaxRent()
        );

        Page<Listing> rawPage = listingRepository.findAll(spec, pageable);

        List<ListingResponse> filteredListings = rawPage.getContent().stream()
                .filter(listing -> matchesLocationOrAmenities(listing, filters))
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        Page<ListingResponse> resultPage = new PageImpl<>(
                filteredListings,
                pageable,
                filteredListings.size()
        );

        return AiSearchResponse.builder()
                .summary(filters.getSummary())
                .parsedFilters(filters)
                .listings(resultPage)
                .build();
    }

    private AiParsedFilters parsePromptToFilters(String query) {
        String lowerQuery = query.toLowerCase();

        ListingType listingType = null;
        if (lowerQuery.contains("pg") || lowerQuery.contains("paying guest")) {
            listingType = ListingType.PG;
        } else if (lowerQuery.contains("flat") || lowerQuery.contains("apartment") || lowerQuery.contains("1bhk") || lowerQuery.contains("2bhk")) {
            listingType = ListingType.FLAT;
        }

        Double maxRent = null;
        Double minRent = null;

        // Pattern for "under 12k", "below 15000", "under 15,000", "less than 20k"
        Pattern rentPattern = Pattern.compile("(under|below|less than|<|budget|max)?\\s*(₹|rs\\.?|inr)?\\s*(\\d+)(k|000)?");
        Matcher rentMatcher = rentPattern.matcher(lowerQuery);
        if (rentMatcher.find()) {
            try {
                String numStr = rentMatcher.group(3);
                double val = Double.parseDouble(numStr);
                if ("k".equalsIgnoreCase(rentMatcher.group(4))) {
                    val *= 1000;
                }
                if (val > 500) { // filter out small single digits
                    maxRent = val;
                }
            } catch (Exception ignored) {}
        }

        // Location / City detection
        String city = null;
        String location = null;
        List<String> knownCities = List.of("bangalore", "bengaluru", "noida", "delhi", "mumbai", "pune", "hyderabad", "gurgaon", "chennai");
        for (String c : knownCities) {
            if (lowerQuery.contains(c)) {
                city = c;
                break;
            }
        }

        // Extract area (e.g. "sector 62", "koramangala", "indiranagar")
        Pattern areaPattern = Pattern.compile("(near|in|at|around)\\s+([a-z0-9\\s]{3,20})");
        Matcher areaMatcher = areaPattern.matcher(lowerQuery);
        if (areaMatcher.find()) {
            location = areaMatcher.group(2).replaceAll("(pg|flat|under|below|veg|food|ac|wifi|k|12k|15k|20k)", "").trim();
        }

        // Amenities extraction
        List<String> amenities = new ArrayList<>();
        if (lowerQuery.contains("veg") || lowerQuery.contains("food") || lowerQuery.contains("mess")) amenities.add("Food");
        if (lowerQuery.contains("ac") || lowerQuery.contains("air conditioner")) amenities.add("AC");
        if (lowerQuery.contains("wifi") || lowerQuery.contains("internet")) amenities.add("WiFi");
        if (lowerQuery.contains("laundry") || lowerQuery.contains("washing")) amenities.add("Laundry");
        if (lowerQuery.contains("parking")) amenities.add("Parking");

        // Construct Summary
        StringBuilder summaryBuilder = new StringBuilder("Here's what I understood: ");
        List<String> parts = new ArrayList<>();

        if (listingType != null) parts.add(listingType.name() + " properties");
        else parts.add("Properties");

        if (location != null && !location.isEmpty()) parts.add("near " + capitalize(location));
        if (city != null) parts.add("in " + capitalize(city));
        if (maxRent != null) parts.add("with rent up to ₹" + String.format("%,.0f", maxRent));
        if (!amenities.isEmpty()) parts.add("offering " + String.join(", ", amenities));

        summaryBuilder.append(String.join(" ", parts)).append(".");

        return AiParsedFilters.builder()
                .city(city)
                .location(location)
                .listingType(listingType)
                .minRent(minRent)
                .maxRent(maxRent)
                .amenities(amenities)
                .summary(summaryBuilder.toString())
                .build();
    }

    private boolean matchesLocationOrAmenities(Listing listing, AiParsedFilters filters) {
        if (filters.getLocation() != null && !filters.getLocation().isEmpty()) {
            boolean locMatch = listing.getLocation().toLowerCase().contains(filters.getLocation().toLowerCase()) ||
                    listing.getTitle().toLowerCase().contains(filters.getLocation().toLowerCase());
            if (!locMatch && filters.getCity() == null) {
                // If location is provided but didn't match location field, check if city contains it
                locMatch = listing.getCity().toLowerCase().contains(filters.getLocation().toLowerCase());
            }
            if (!locMatch) return false;
        }

        if (filters.getAmenities() != null && !filters.getAmenities().isEmpty()) {
            for (String requiredAmenity : filters.getAmenities()) {
                boolean hasAmenity = listing.getAmenities().stream()
                        .anyMatch(a -> a.equalsIgnoreCase(requiredAmenity) || a.toLowerCase().contains(requiredAmenity.toLowerCase()));
                if (!hasAmenity) {
                    // check description or title
                    boolean descMatch = (listing.getDescription() != null && listing.getDescription().toLowerCase().contains(requiredAmenity.toLowerCase()))
                            || listing.getTitle().toLowerCase().contains(requiredAmenity.toLowerCase());
                    if (!descMatch) return false;
                }
            }
        }
        return true;
    }

    private ListingResponse mapToResponse(Listing listing) {
        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .rent(listing.getRent())
                .location(listing.getLocation())
                .city(listing.getCity())
                .listingType(listing.getListingType())
                .amenities(listing.getAmenities())
                .images(listing.getImages())
                .ownerId(listing.getOwner().getId())
                .ownerName(listing.getOwner().getName())
                .build();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }
}
