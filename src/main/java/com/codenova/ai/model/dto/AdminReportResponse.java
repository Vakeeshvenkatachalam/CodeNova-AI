package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportResponse {
    private long totalUsers;
    private long activeLoginsToday;
    private double participationRate;
    private long totalSubmissions;
    private long totalSessions;
    private long totalXpOverall;
    private double averageXpPerUser;
    private Map<String, Long> languageDistribution;
    private long currentMonthSubmissions;
}
