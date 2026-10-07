package com.settlein.backend.controller;

import com.settlein.backend.dto.*;
import com.settlein.backend.entity.User;
import com.settlein.backend.service.TiffinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tiffin-providers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TiffinController {

    private final TiffinService tiffinService;

    @PostMapping
    public ResponseEntity<TiffinProviderResponse> createProvider(
            @RequestBody TiffinProviderRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tiffinService.createProvider(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<TiffinProviderResponse>> getAllProviders(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double maxPrice
    ) {
        return ResponseEntity.ok(tiffinService.getAllProviders(area, city, maxPrice));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<TiffinProviderResponse>> getRecommendations(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tiffinService.getRecommendations(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TiffinProviderResponse> getProviderById(@PathVariable Long id) {
        return ResponseEntity.ok(tiffinService.getProviderById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TiffinProviderResponse> updateProvider(
            @PathVariable Long id,
            @RequestBody TiffinProviderRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tiffinService.updateProvider(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProvider(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        tiffinService.deleteProvider(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // --- REVIEWS ---

    @PostMapping("/{id}/reviews")
    public ResponseEntity<TiffinReviewResponse> addReview(
            @PathVariable Long id,
            @RequestBody TiffinReviewRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tiffinService.addReview(id, request, currentUser));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<TiffinReviewResponse>> getProviderReviews(@PathVariable Long id) {
        return ResponseEntity.ok(tiffinService.getProviderReviews(id));
    }
}
