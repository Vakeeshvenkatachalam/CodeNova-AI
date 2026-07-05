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
public class DashboardSummaryResponse {
    private int currentStreak;
    private int maxStreak;
    private long solvedCount;
    private long attemptedCount;
    private long chatSessionsCount;
    private long interviewSessionsCount;
    private String activeCategory;
    private List<RecentActivity> recentActivities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String name;
        private String time;
        private String status; // 'PASSED', 'FAILED', 'COMPLETED', etc.
    }
}
