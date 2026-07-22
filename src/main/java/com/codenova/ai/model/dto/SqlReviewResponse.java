package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SqlReviewResponse {
    private String status; // 'CORRECT', 'INCORRECT'
    private String feedback;
    private String optimalQuery;
    private String optimizationAdvice;
    private String learningRoadmap;
}
