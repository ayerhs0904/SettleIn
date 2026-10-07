package com.settlein.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TiffinReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
}
