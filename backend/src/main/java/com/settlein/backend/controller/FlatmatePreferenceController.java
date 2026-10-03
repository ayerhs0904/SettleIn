package com.settlein.backend.controller;

import com.settlein.backend.dto.FlatmatePreferenceRequest;
import com.settlein.backend.dto.FlatmatePreferenceResponse;
import com.settlein.backend.entity.User;
import com.settlein.backend.service.FlatmatePreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlatmatePreferenceController {

    private final FlatmatePreferenceService preferenceService;

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
