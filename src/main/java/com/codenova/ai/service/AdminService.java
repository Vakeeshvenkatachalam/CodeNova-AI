package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private PracticeProblemRepository practiceProblemRepository;

    @Autowired
    private UploadedDocumentRepository uploadedDocumentRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private org.springframework.core.env.Environment env;

    // ─── List Users (safe DTO, no passwordHash) ─────────────────────────────

    @Transactional(readOnly = true)
    public List<UserSummaryDto> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserSummaryDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .name(u.getName())
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Platform Metrics ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminMetricsResponse getPlatformMetrics() {
        long totalUsers = userRepository.count();
        long totalSubmissions = submissionRepository.count();
        long totalProblems = practiceProblemRepository.count();
        long totalDocuments = uploadedDocumentRepository.count();

        log.info("Admin platform stats: users={}, submissions={}, problems={}, docs={}",
                totalUsers, totalSubmissions, totalProblems, totalDocuments);

        return AdminMetricsResponse.builder()
                .totalUsersCount(totalUsers)
                .totalSubmissionsCount(totalSubmissions)
                .totalPracticeProblemsCount(totalProblems)
                .totalKnowledgeDocumentsCount(totalDocuments)
                .build();
    }

    // ─── Toggle Admin Role ───────────────────────────────────────────────────

    @Transactional
    public void toggleUserAccess(Long id, String action) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: ID " + id));

        if ("PROMOTE".equalsIgnoreCase(action)) {
            targetUser.setRole("ROLE_ADMIN");
        } else if ("DEMOTE".equalsIgnoreCase(action)) {
            targetUser.setRole("ROLE_USER");
        } else {
            throw new IllegalArgumentException("Invalid action: must be PROMOTE or DEMOTE");
        }

        userRepository.save(targetUser);
        log.warn("Admin toggled user ID={} action={}", id, action);
    }

    // ─── Individual Student Progress ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminUserProgressResponse getUserProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: ID " + userId));

        // Fetch progress — default to level 1 / 0 XP if not yet created
        UserProgress progress = userProgressRepository.findByUser(user)
                .orElse(UserProgress.builder().level(1).totalXp(0).build());

        long solvedCount = submissionRepository.countByUserAndStatus(user, "PASSED");
        long totalSubmits = submissionRepository.countByUser(user);
        long chatCount = conversationRepository.countByUser(user);

        // Language strength calculation
        List<Submission> passedSubmissions = submissionRepository.findByUserAndStatus(user, "PASSED");
        Map<String, Long> solvesByLang = passedSubmissions.stream()
                .collect(Collectors.groupingBy(Submission::getLanguage, Collectors.counting()));

        String strongest = solvesByLang.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "Java");

        // Recent submissions — null-safe problem title
        List<Submission> recentSubmits = submissionRepository.findTop10ByUserOrderByCreatedAtDesc(user);
        List<AdminUserProgressResponse.SubmissionDetail> subDetails = recentSubmits.stream()
                .map(sub -> AdminUserProgressResponse.SubmissionDetail.builder()
                        .id(sub.getId())
                        .problemTitle(sub.getPracticeProblem() != null
                                ? sub.getPracticeProblem().getTitle()
                                : "Workspace Sandbox")
                        .language(sub.getLanguage())
                        .status(sub.getStatus())
                        .createdAt(sub.getCreatedAt() != null ? sub.getCreatedAt().toString() : "")
                        .build())
                .collect(Collectors.toList());

        return AdminUserProgressResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .bio(user.getBio())
                .preferredLanguage(user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "Java")
                .level(progress.getLevel())
                .totalXp(progress.getTotalXp())
                .problemsSolved(solvedCount)
                .totalSubmissions(totalSubmits)
                .totalSessions(chatCount)
                .solvesByLanguage(solvesByLang)
                .strongestLanguage(strongest)
                .recentSubmissions(subDetails)
                .build();
    }

    // ─── Overall Platform Report ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminReportResponse getOverallReport() {
        long totalUsers = userRepository.count();
        long totalSubmits = submissionRepository.count();
        long totalChats = conversationRepository.count();

        // Active logins = users whose updatedAt is within the last 24h
        Instant activeLimit = Instant.now().minus(24, ChronoUnit.HOURS);
        long activeLogins = userRepository.findAll().stream()
                .filter(u -> u.getUpdatedAt() != null && u.getUpdatedAt().isAfter(activeLimit))
                .count();

        // Participation = users who have at least 1 submission OR 1 chat session
        long activeUsers = 0;
        if (totalUsers > 0) {
            activeUsers = userRepository.findAll().stream()
                    .filter(u -> submissionRepository.countByUser(u) > 0
                            || conversationRepository.countByUser(u) > 0)
                    .count();
        }
        double participation = totalUsers > 0 ? ((double) activeUsers / totalUsers) * 100.0 : 0.0;

        // XP totals
        long totalXp = userProgressRepository.findAll().stream()
                .mapToLong(UserProgress::getTotalXp)
                .sum();
        double avgXp = totalUsers > 0 ? (double) totalXp / totalUsers : 0.0;

        // Current month submissions (last 30 days)
        Instant firstOfMonth = Instant.now().minus(30, ChronoUnit.DAYS);
        long currentMonthSubmits = submissionRepository.findAll().stream()
                .filter(s -> s.getCreatedAt() != null && s.getCreatedAt().isAfter(firstOfMonth))
                .count();

        // Language strength distribution — one pass per user, with null safety
        Map<String, Long> distribution = new HashMap<>();
        for (User u : userRepository.findAll()) {
            List<Submission> passed = submissionRepository.findByUserAndStatus(u, "PASSED");
            if (passed.isEmpty()) {
                // Count the preferred language even for non-solving users
                String lang = u.getPreferredLanguage() != null ? u.getPreferredLanguage() : "Java";
                distribution.merge(lang, 1L, Long::sum);
                continue;
            }
            String strongest = passed.stream()
                    .collect(Collectors.groupingBy(Submission::getLanguage, Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(u.getPreferredLanguage() != null ? u.getPreferredLanguage() : "Java");
            distribution.merge(strongest, 1L, Long::sum);
        }

        return AdminReportResponse.builder()
                .totalUsers(totalUsers)
                .activeLoginsToday(activeLogins)
                .participationRate(participation)
                .totalSubmissions(totalSubmits)
                .totalSessions(totalChats)
                .totalXpOverall(totalXp)
                .averageXpPerUser(avgXp)
                .languageDistribution(distribution)
                .currentMonthSubmissions(currentMonthSubmits)
                .build();
    }
}
