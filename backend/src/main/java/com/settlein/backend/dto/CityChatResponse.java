package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CityChatResponse {
    private String answer;
    private String city;
    private List<String> sources; // Titles of retrieved context chunks
    private double confidenceScore;
}
