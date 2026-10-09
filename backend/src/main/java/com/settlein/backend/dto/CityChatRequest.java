package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CityChatRequest {
    private String message;
    private String city; // Optional: Noida, Delhi, Bengaluru (auto-detected if null)
}
