package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetricsResponse {
    private long totalUsersCount;
    private long totalSubmissionsCount;
    private long totalPracticeProblemsCount;
    private long totalKnowledgeDocumentsCount;
}
