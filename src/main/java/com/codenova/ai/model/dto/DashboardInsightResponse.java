package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardInsightResponse {
    private String summary;
    private String recommendation;
    private String targetModule; // e.g. 'PRACTICE', 'MENTOR', 'SQL_MENTOR', 'KNOWLEDGE_BASE'
}
