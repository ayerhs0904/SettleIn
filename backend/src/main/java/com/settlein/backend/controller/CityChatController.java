package com.settlein.backend.controller;

import com.settlein.backend.dto.CityChatRequest;
import com.settlein.backend.dto.CityChatResponse;
import com.settlein.backend.service.CityChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CityChatController {

    private final CityChatbotService chatbotService;

    @PostMapping("/city")
    public ResponseEntity<CityChatResponse> askCityQuestion(@RequestBody CityChatRequest request) {
        return ResponseEntity.ok(chatbotService.askCityQuestion(request));
    }
}
