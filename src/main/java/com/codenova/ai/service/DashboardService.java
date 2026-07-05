package com.codenova.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        Streak streak = streakRepository.findByUser(user)
                .orElse(Streak.builder().currentStreak(0).maxStreak(0).build());

        long solvedCount = submissionRepository.countByUserAndStatus(user, "PASSED");
        long attemptedCount = submissionRepository.countByUser(user);
        long chatSessionsCount = conversationRepository.countByUser(user);
        long interviewSessionsCount = interviewSessionRepository.countByUserAndStatus(user, "COMPLETED");

        // Map recent submissions to DTO
        List<Submission> recentSubmissions = submissionRepository.findTop5ByUserOrderByCreatedAtDesc(user);
        List<DashboardSummaryResponse.RecentActivity> activities = recentSubmissions.stream()
                .map(sub -> DashboardSummaryResponse.RecentActivity.builder()
                        .name(sub.getPracticeProblem().getTitle())
                        .time(sub.getCreatedAt().toString())
                        .status(sub.getStatus())
                        .build())
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .currentStreak(streak.getCurrentStreak())
                .maxStreak(streak.getMaxStreak())
                .solvedCount(solvedCount)
                .attemptedCount(attemptedCount)
                .chatSessionsCount(chatSessionsCount)
                .interviewSessionsCount(interviewSessionsCount)
                .activeCategory(solvedCount > 0 ? "Algorithms" : "None") // Fallback mock category for now
                .recentActivities(activities)
                .build();
    }

    @Transactional
    public DashboardInsightResponse getInsights(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("User progress details not seeded"));

        // 1. Check persistent DB cache (within 24 hours)
        if (progress.getLastInsightText() != null && progress.getLastInsightGeneratedAt() != null) {
            long hoursElapsed = ChronoUnit.HOURS.between(progress.getLastInsightGeneratedAt(), Instant.now());
            if (hoursElapsed < 24) {
                try {
                    return objectMapper.readValue(progress.getLastInsightText(), DashboardInsightResponse.class);
                } catch (Exception e) {
                    log.warn("Failed to parse cached dashboard insight JSON for user: {}", email, e);
                }
            }
        }

        // 2. Cache expired or not present - call Gemini API
        DashboardInsightResponse insightResponse;
        try {
            DashboardSummaryResponse summary = getSummary(email);
            
            // Load prompt resource
            ClassPathResource resource = new ClassPathResource("prompts/dashboard-insights.txt");
            String promptTemplate;
            try (InputStream is = resource.getInputStream()) {
                promptTemplate = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }

            // Bind values
            String recentNames = summary.getRecentActivities().stream()
                    .map(DashboardSummaryResponse.RecentActivity::getName)
                    .collect(Collectors.joining(", "));
            
            String prompt = promptTemplate
                    .replace("{{streak}}", String.valueOf(summary.getCurrentStreak()))
                    .replace("{{solvedCount}}", String.valueOf(summary.getSolvedCount()))
                    .replace("{{activeCategory}}", summary.getActiveCategory())
                    .replace("{{recentSubmissions}}", recentNames.isEmpty() ? "None" : recentNames);

            // Execute Gemini query
            String rawAiResponse = chatLanguageModel.generate(prompt);
            
            // Clean markdown blocks if Gemini outputs them anyway (fail-safe clean up)
            String cleanJsonResponse = rawAiResponse
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            // Validate structure
            insightResponse = objectMapper.readValue(cleanJsonResponse, DashboardInsightResponse.class);

            // Write to persistent DB cache
            progress.setLastInsightText(cleanJsonResponse);
            progress.setLastInsightGeneratedAt(Instant.now());
            userProgressRepository.save(progress);

            log.info("Successfully generated and cached new AI dashboard insights for user: {}", email);
        } catch (Exception e) {
            log.error("AI Insight generation failed for user: {}. Triggering default fallback.", email, e);
            
            // Graceful fallback to avoid page load crashes
            insightResponse = DashboardInsightResponse.builder()
                    .summary("Your CodeNova dashboard is ready and active.")
                    .recommendation("Start practicing simple algorithm questions to kick off your AI learning journey.")
                    .targetModule("PRACTICE")
                    .build();
        }

        return insightResponse;
    }
}
