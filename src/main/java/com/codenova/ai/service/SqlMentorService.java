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
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;


@Service
public class SqlMentorService {

    private static final Logger log = LoggerFactory.getLogger(SqlMentorService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SqlMentorHistoryRepository sqlMentorHistoryRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();


    private static final String SCHEMA_METADATA = 
            "Target Schema Details:\n" +
            "1. users (id BIGINT PK, email VARCHAR, role VARCHAR)\n" +
            "2. submissions (id BIGINT PK, user_id BIGINT FK, code TEXT, status VARCHAR, language VARCHAR, created_at DATETIME)";

    @Transactional
    public SqlGenerateResponse generateSql(String email, SqlGenerateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        String prompt = "You are a professional SQL database architect. Translate this English prompt into a SQL query matching the target schema.\n" +
                SCHEMA_METADATA + "\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"sql\": \"SELECT email FROM users WHERE role = 'ROLE_USER';\",\n" +
                "  \"explanation\": \"Brief logical explanation of joins and filters used.\"\n" +
                "}\n" +
                "User Request: " + request.getPrompt();

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdownJson(rawAiResponse);


        SqlGenerateResponse response;
        try {
            response = objectMapper.readValue(cleanJson, SqlGenerateResponse.class);

            // Log history to MySQL
            SqlMentorHistory history = SqlMentorHistory.builder()
                    .user(user)
                    .queryText(request.getPrompt())
                    .executionPlan(response.getSql())
                    .explanation(response.getExplanation())
                    .isCorrect(true)
                    .build();
            sqlMentorHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to parse SQL generation response", e);
            throw new RuntimeException("AI SQL generator formatting failure");
        }

        return response;
    }

    @Transactional
    public SqlReviewResponse reviewSql(String email, SqlReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        String prompt = "You are an expert SQL query reviewer. Validate the user's attempted SQL query against the target schema and requested goal.\n" +
                SCHEMA_METADATA + "\n" +
                "Goal: " + request.getPrompt() + "\n" +
                "User Query Attempt:\n" + request.getUserSql() + "\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"status\": \"CORRECT or INCORRECT\",\n" +
                "  \"feedback\": \"Highlight syntax mistakes, performance gaps, or wrong filters. If correct, congratulate the user.\",\n" +
                "  \"optimalQuery\": \"Provide the most optimal, standard syntax solution query for the requested goal.\",\n" +
                "  \"optimizationAdvice\": \"Explain performance gaps, Join choices, query complexity, index potential, or normalization issues.\",\n" +
                "  \"learningRoadmap\": \"List recommended subtopics (e.g., JOIN constraints, aggregation filters, or window calculations) the user should revise based on mistakes.\"\n" +
                "}\n";

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdownJson(rawAiResponse);


        SqlReviewResponse response;
        try {
            response = objectMapper.readValue(cleanJson, SqlReviewResponse.class);

            // Log user attempt back to history table
            SqlMentorHistory history = SqlMentorHistory.builder()
                    .user(user)
                    .queryText(request.getPrompt())
                    .executionPlan(request.getUserSql())
                    .explanation("User attempt was " + response.getStatus() + ". Feedback: " + response.getFeedback())
                    .isCorrect("CORRECT".equalsIgnoreCase(response.getStatus()))
                    .build();
            sqlMentorHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to parse SQL reviewer report", e);
            throw new RuntimeException("AI SQL reviewer formatting failure");
        }

        return response;
    }

    public SqlExecuteResponse executeSql(String email, SqlExecuteRequest request) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        String sql = request.getSql() != null ? request.getSql().trim() : "";
        
        // Basic security check: only SELECT is allowed
        if (!sql.toLowerCase().startsWith("select")) {
            return SqlExecuteResponse.builder()
                    .success(false)
                    .errorMessage("Security Exception: Only SELECT queries are permitted in SQL Mentor.")
                    .build();
        }

        try {
            List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            List<String> columns = new java.util.ArrayList<>();
            if (!rows.isEmpty()) {
                columns.addAll(rows.get(0).keySet());
            }
            
            List<List<String>> formattedRows = new java.util.ArrayList<>();
            for (java.util.Map<String, Object> row : rows) {
                List<String> formattedRow = new java.util.ArrayList<>();
                for (String col : columns) {
                    Object val = row.get(col);
                    formattedRow.add(val != null ? val.toString() : "NULL");
                }
                formattedRows.add(formattedRow);
            }

            return SqlExecuteResponse.builder()
                    .success(true)
                    .columns(columns)
                    .rows(formattedRows)
                    .rowCount(rows.size())
                    .build();
        } catch (Exception e) {
            log.warn("SQL Mentor execution failed for query: {}", sql, e);
            String message = e.getMessage();
            if (e.getCause() != null) {
                message = e.getCause().getMessage();
            }
            return SqlExecuteResponse.builder()
                    .success(false)
                    .errorMessage(message)
                    .build();
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

