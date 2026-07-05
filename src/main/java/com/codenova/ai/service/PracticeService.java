package com.codenova.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PracticeService {

    private static final Logger log = LoggerFactory.getLogger(PracticeService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PracticeProblemRepository practiceProblemRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<PracticeProblem> listProblems() {
        return practiceProblemRepository.findAll();
    }

    @Transactional
    public PracticeProblem generateProblem(String category, String difficulty) {
        String prompt = "You are a professional LeetCode algorithm problem designer. Generate a new programming challenge.\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"title\": \"Problem Name\",\n" +
                "  \"description\": \"Details describing the inputs, expected outputs, and constraints.\",\n" +
                "  \"starterCode\": \"public class Solution {\\n    public int solve() {\\n        // code here\\n    }\\n}\",\n" +
                "  \"solutionCode\": \"Target correct solution code here\",\n" +
                "  \"testCasesJson\": \"[{\\\"input\\\": \\\"[1, 2]\\\", \\\"expected\\\": \\\"3\\\"}]\",\n" +
                "  \"points\": 15\n" +
                "}\n" +
                "Topic/Category: " + category + "\n" +
                "Difficulty: " + difficulty;

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdownJson(rawAiResponse);


        try {
            PracticeProblem template = objectMapper.readValue(cleanJson, PracticeProblem.class);
            template.setCategory(category);
            template.setDifficulty(difficulty);
            
            return practiceProblemRepository.save(template);
        } catch (Exception e) {
            log.error("Failed to parse dynamic AI problem template", e);
            throw new RuntimeException("AI Problem Design format violation");
        }
    }

    @Transactional
    public PracticeSubmitResponse submitAttempt(String email, Long problemId, PracticeSubmitRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        PracticeProblem problem = practiceProblemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found"));

        String prompt = "You are a code executor evaluator. Grade the user's attempt code against the problem requirements.\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"status\": \"PASSED or FAILED\",\n" +
                "  \"feedback\": \"Detailed feedback on why it failed or congrats on success\",\n" +
                "  \"pointsEarned\": 10\n" +
                "}\n" +
                "Problem: " + problem.getTitle() + "\n" +
                "Description: " + problem.getDescription() + "\n" +
                "Solution Reference: " + problem.getSolutionCode() + "\n" +
                "User Code:\n" + request.getCode();

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdownJson(rawAiResponse);


        PracticeSubmitResponse response;
        try {
            response = objectMapper.readValue(cleanJson, PracticeSubmitResponse.class);
            
            // Save submission history to database
            Submission submission = Submission.builder()
                    .user(user)
                    .practiceProblem(problem)
                    .code(request.getCode())
                    .language(request.getLanguage())
                    .status(response.getStatus())
                    .executionTimeMs(50) // Mock execution time
                    .feedback(response.getFeedback())
                    .build();
            submissionRepository.save(submission);

            // If passed, award XP in user progress
            if ("PASSED".equalsIgnoreCase(response.getStatus())) {
                UserProgress progress = userProgressRepository.findByUser(user)
                        .orElseThrow(() -> new IllegalStateException("User progress not seeded"));
                progress.setTotalXp(progress.getTotalXp() + response.getPointsEarned());
                // Level calculations: every 100 XP levels up!
                progress.setLevel((progress.getTotalXp() / 100) + 1);
                userProgressRepository.save(progress);
            }
        } catch (Exception e) {
            log.error("Failed to parse code execution grade", e);
            throw new RuntimeException("AI Grading format violation");
        }

        return response;
    }

    public String getHint(Long problemId) {
        PracticeProblem problem = practiceProblemRepository.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found"));

        String prompt = "You are an encouraging programming tutor. Provide a single short hint (1-2 sentences) for the following problem.\n" +
                "Do NOT give solution code. Focus on the algorithmic approach.\n" +
                "Problem: " + problem.getTitle() + "\n" +
                "Description: " + problem.getDescription();

        try {
            return chatLanguageModel.generate(prompt);
        } catch (Exception e) {
            log.warn("Hint generation failed: {}", e.getMessage());
            return "Try breaking down the problem into smaller logical sub-problems first!";
        }
    }

    private String cleanMarkdownJson(String rawResponse) {
        if (rawResponse == null) return "";
        String trimmed = rawResponse.trim();
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start != -1 && end != -1 && start < end) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed.replace("```json", "")
                .replace("```JSON", "")
                .replace("```", "")
                .trim();
    }
}

