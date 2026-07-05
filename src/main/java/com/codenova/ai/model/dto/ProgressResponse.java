package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressResponse {
    private int level;
    private int totalXp;
    private long problemsSolved;
    private long totalSubmissions;
    private long totalSessions;
    private String aiRoadmapRecommendation;
    private List<DailyActivityCount> activityTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyActivityCount {
        private String date; // 'YYYY-MM-DD'
        private long count;
    }
}
