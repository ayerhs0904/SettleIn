package com.settlein.backend.controller;

import com.settlein.backend.dto.ListingRequest;
import com.settlein.backend.dto.ListingResponse;
import com.settlein.backend.entity.ListingType;
import com.settlein.backend.entity.User;
import com.settlein.backend.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.settlein.backend.dto.AiSearchRequest;
import com.settlein.backend.dto.AiSearchResponse;
import com.settlein.backend.service.AiSearchService;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ListingController {

    private final ListingService listingService;
    private final AiSearchService aiSearchService;

    @PostMapping("/ai-search")
    public ResponseEntity<AiSearchResponse> searchWithAi(
            @RequestBody AiSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(aiSearchService.searchWithAi(request.getQuery(), pageable));
    }

    @PostMapping
    public ResponseEntity<ListingResponse> createListing(
            @RequestBody ListingRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(listingService.createListing(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<Page<ListingResponse>> getAllListings(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) ListingType listingType,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(listingService.getAllListings(city, listingType, minRent, maxRent, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long id,
            @RequestBody ListingRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(listingService.updateListing(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        listingService.deleteListing(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
