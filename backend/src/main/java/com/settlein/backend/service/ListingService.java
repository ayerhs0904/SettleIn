package com.settlein.backend.service;

import com.settlein.backend.dto.CityAnalyticsResponse;
import com.settlein.backend.dto.ListingRequest;
import com.settlein.backend.dto.ListingResponse;
import com.settlein.backend.entity.Listing;
import com.settlein.backend.entity.ListingType;
import com.settlein.backend.entity.User;
import com.settlein.backend.repository.ListingRepository;
import com.settlein.backend.repository.ListingSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final TrustScoreService trustScoreService;

    public ListingResponse createListing(ListingRequest request, User owner) {
        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .rent(request.getRent())
                .location(request.getLocation())
                .city(request.getCity())
                .listingType(request.getListingType())
                .amenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>())
                .images(request.getImages() != null ? request.getImages() : new ArrayList<>())
                .owner(owner)
                .build();

        // Evaluate trust score before initial save
        trustScoreService.evaluateTrustScore(listing);

        Listing saved = listingRepository.save(listing);
        return mapToResponse(saved);
    }

    public Page<ListingResponse> getAllListings(
            String city,
            ListingType listingType,
            Double minRent,
            Double maxRent,
            Pageable pageable
    ) {
        var spec = ListingSpecification.filterListings(city, listingType, minRent, maxRent);
        return listingRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional
    public ListingResponse getListingById(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        listing.setViewCount((listing.getViewCount() == null ? 0L : listing.getViewCount()) + 1L);
        Listing saved = listingRepository.save(listing);
        return mapToResponse(saved);
    }

    public List<ListingResponse> getListingsByOwner(User currentUser) {
        return listingRepository.findByOwnerId(currentUser.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CityAnalyticsResponse> getCityAnalytics() {
        List<Listing> all = listingRepository.findAll();
        Map<String, List<Listing>> byCity = all.stream()
                .filter(l -> l.getCity() != null && !l.getCity().trim().isEmpty())
                .collect(Collectors.groupingBy(l -> l.getCity().trim()));

        return byCity.entrySet().stream().map(entry -> {
            String city = entry.getKey();
            List<Listing> list = entry.getValue();
            long count = list.size();
            double avgRent = list.stream().mapToDouble(Listing::getRent).average().orElse(0.0);
            double minRent = list.stream().mapToDouble(Listing::getRent).min().orElse(0.0);
            double maxRent = list.stream().mapToDouble(Listing::getRent).max().orElse(0.0);
            return CityAnalyticsResponse.builder()
                    .city(city)
                    .totalListings(count)
                    .averageRent(Math.round(avgRent * 100.0) / 100.0)
                    .minRent(minRent)
                    .maxRent(maxRent)
                    .build();
        }).sorted((a, b) -> Long.compare(b.getTotalListings(), a.getTotalListings()))
          .toList();
    }

    public ListingResponse updateListing(Long id, ListingRequest request, User currentUser) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        verifyOwner(listing, currentUser);

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setRent(request.getRent());
        listing.setLocation(request.getLocation());
        listing.setCity(request.getCity());
        listing.setListingType(request.getListingType());
        if (request.getAmenities() != null) listing.setAmenities(request.getAmenities());
        if (request.getImages() != null) listing.setImages(request.getImages());

        // Re-evaluate trust score on update
        trustScoreService.evaluateTrustScore(listing);

        Listing updated = listingRepository.save(listing);
        return mapToResponse(updated);
    }

    public void deleteListing(Long id, User currentUser) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        verifyOwner(listing, currentUser);

        listingRepository.delete(listing);
    }

    private void verifyOwner(Listing listing, User currentUser) {
        if (!listing.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the listing owner can modify or delete this listing");
        }
    }

    private ListingResponse mapToResponse(Listing listing) {
        // Evaluate dynamically if missing
        if (listing.getTrustScore() == null || listing.getTrustBadge() == null) {
            trustScoreService.evaluateTrustScore(listing);
        }

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
                .trustScore(listing.getTrustScore())
                .trustBadge(listing.getTrustBadge())
                .trustFlags(listing.getTrustFlags())
                .viewCount(listing.getViewCount() != null ? listing.getViewCount() : 0L)
                .build();
    }
}
