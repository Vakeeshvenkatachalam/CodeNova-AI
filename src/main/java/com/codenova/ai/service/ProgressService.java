package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProgressService {

    private static final Logger log = LoggerFactory.getLogger(ProgressService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    @Transactional(readOnly = true)
    public ProgressResponse getProgress(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Progress details not seeded"));

        long solvedCount = submissionRepository.countByUserAndStatus(user, "PASSED");
        long totalSubmissions = submissionRepository.countByUser(user);
        long chatCount = conversationRepository.countByUser(user);

        // Reconstruct daily activity counts for last 7 days (trend data)
        List<ProgressResponse.DailyActivityCount> trends = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate targetDate = today.minusDays(i);
            String dateString = targetDate.format(formatter);
            
            // Mock dynamic distribution counting for trend graphing
            long dayCount = (i == 0) ? totalSubmissions : (i % 2 == 0) ? 1 : 0;

            trends.add(ProgressResponse.DailyActivityCount.builder()
                    .date(dateString)
                    .count(dayCount)
                    .build());
        }

        // Call Gemini for high-level roadmap trends advice
        String aiRecommendation;
        try {
            String prompt = "You are a senior technical advisor. Analyze the user's progress:\n" +
                    "- Level: " + progress.getLevel() + "\n" +
                    "- Total XP: " + progress.getTotalXp() + " XP\n" +
                    "- Problems Solved: " + solvedCount + "\n" +
                    "- Chat Mentor Sessions: " + chatCount + "\n" +
                    "Generate a short, encouraging 2-sentence roadmap recommendation (max 50 words) targeting what concepts they should study next.";
            aiRecommendation = chatLanguageModel.generate(prompt);
        } catch (Exception e) {
            log.warn("Failed to generate AI roadmap insights: {}", e.getMessage());
            aiRecommendation = "Keep solving algorithm problems and asking your AI Mentor for help on new structures!";
        }

        return ProgressResponse.builder()
                .level(progress.getLevel())
                .totalXp(progress.getTotalXp())
                .problemsSolved(solvedCount)
                .totalSubmissions(totalSubmissions)
                .totalSessions(chatCount)
                .aiRoadmapRecommendation(aiRecommendation)
                .activityTrends(trends)
                .build();
    }
}
