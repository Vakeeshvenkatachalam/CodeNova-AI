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
public class InterviewService {

    private static final Logger log = LoggerFactory.getLogger(InterviewService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private InterviewQuestionRepository interviewQuestionRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public InterviewSession createSession(String email, InterviewSessionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .roleTarget(request.getRoleTarget())
                .seniority(request.getDifficulty())
                .companyTarget("General")
                .status("IN_PROGRESS")
                .build();

        return interviewSessionRepository.save(session);
    }

    @Transactional
    public InterviewQuestion generateQuestion(Long sessionId, String email) {
        // Validate owner
        InterviewSession session = getValidatedSession(sessionId, email);

        String prompt = "You are a professional software engineer interviewer. Generate a single target interview question based on the role and difficulty.\n" +
                "Do NOT write any JSON wrapper. Just respond with the question text in plain sentences.\n" +
                "Role Target: " + session.getRoleTarget() + "\n" +
                "Difficulty: " + session.getSeniority();

        String questionText = chatLanguageModel.generate(prompt);

        InterviewQuestion question = InterviewQuestion.builder()
                .interviewSession(session)
                .questionText(questionText)
                .build();

        return interviewQuestionRepository.save(question);
    }

    @Transactional
    public InterviewEvaluationResponse evaluateAnswer(Long questionId, String email, InterviewEvaluationRequest request) {
        InterviewQuestion question = interviewQuestionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        InterviewSession session = getValidatedSession(question.getInterviewSession().getId(), email);

        String prompt = "You are a senior hiring manager. Grade the user's answer to the technical question based on their target role and difficulty.\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"strengths\": \"Brief details of what the user explained correctly\",\n" +
                "  \"gaps\": \"Details of what core concepts they missed or explained incorrectly\",\n" +
                "  \"score\": 78,\n" +
                "  \"improvement\": \"Clues and resources on how to improve this answer\"\n" +
                "}\n" +
                "Role Target: " + session.getRoleTarget() + "\n" +
                "Question: " + question.getQuestionText() + "\n" +
                "User Answer:\n" + request.getUserAnswer();

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdownJson(rawAiResponse);

        InterviewEvaluationResponse response;
        try {
            response = objectMapper.readValue(cleanJson, InterviewEvaluationResponse.class);

            // Update database records
            question.setUserAnswer(request.getUserAnswer());
            question.setFeedback(cleanJson);
            question.setScore(response.getScore());
            interviewQuestionRepository.save(question);

            // Check if session can be set to COMPLETED if active list finishes
            session.setStatus("COMPLETED");
            interviewSessionRepository.save(session);
        } catch (Exception e) {
            log.error("Failed to parse interview evaluation report", e);
            throw new RuntimeException("AI Evaluator formatting failure");
        }

        return response;
    }

    private InterviewSession getValidatedSession(Long sessionId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied to interview session");
        }

        return session;
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
