package com.settlein.backend.dto;

import com.settlein.backend.entity.InteractionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FlatmateInteractionRequest {
    private Long targetUserId;
    private InteractionStatus action; // INTERESTED or SKIPPED
}
