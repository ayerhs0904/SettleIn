package com.settlein.backend.controller;

import com.settlein.backend.dto.*;
import com.settlein.backend.entity.User;
import com.settlein.backend.service.FlatmateMatchingService;
import com.settlein.backend.service.FlatmatePreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlatmatePreferenceController {

    private final FlatmatePreferenceService preferenceService;
    private final FlatmateMatchingService matchingService;

    @GetMapping("/matches")
    public ResponseEntity<List<FlatmateMatchResponse>> getTopMatches(
            @RequestParam(defaultValue = "10") int top,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(matchingService.findTopMatches(currentUser, top));
    }

    @PostMapping("/interact")
    public ResponseEntity<FlatmateInteractionResponse> recordInteraction(
            @RequestBody FlatmateInteractionRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(matchingService.recordInteraction(currentUser, request));
    }

    @GetMapping("/interests")
    public ResponseEntity<FlatmateInterestGroupResponse> getInterestsGroup(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(matchingService.getInterestsGroup(currentUser));
    }

    @PostMapping
    public ResponseEntity<FlatmatePreferenceResponse> savePreference(
            @RequestBody FlatmatePreferenceRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(preferenceService.saveOrUpdatePreference(request, currentUser));
    }

    @GetMapping("/me")
    public ResponseEntity<FlatmatePreferenceResponse> getMyPreference(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(preferenceService.getPreferenceByUser(currentUser));
    }
}
