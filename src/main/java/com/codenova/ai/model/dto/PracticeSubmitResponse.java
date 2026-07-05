package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSubmitResponse {
    private String status; // 'PASSED', 'FAILED'
    private String feedback;
    private int pointsEarned;
}
