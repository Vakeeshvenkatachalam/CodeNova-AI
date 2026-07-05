package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserProgressResponse {
    private String email;
    private String name;
    private String bio;
    private String preferredLanguage;
    private int level;
    private int totalXp;
    private long problemsSolved;
    private long totalSubmissions;
    private long totalSessions;
    private Map<String, Long> solvesByLanguage;
    private String strongestLanguage;
    private List<SubmissionDetail> recentSubmissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionDetail {
        private Long id;
        private String problemTitle;
        private String language;
        private String status;
        private String createdAt;
    }
}
