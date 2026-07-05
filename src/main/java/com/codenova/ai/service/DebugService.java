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

@Service
public class DebugService {

    private static final Logger log = LoggerFactory.getLogger(DebugService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DebugSessionRepository debugSessionRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public DebugResponse analyzeBug(String email, DebugRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        String prompt = "You are an expert compiler debugger. Analyze this code and trace why the error is occurring.\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"rootCause\": \"Short description of the bug (e.g. index out of bounds on line 5)\",\n" +
                "  \"fixReasoning\": \"Step-by-step logic detailing how to fix it\",\n" +
                "  \"suggestedCode\": \"The ENTIRE corrected code file with the fix applied. Do NOT suggest just a fragment or snippet. Return the complete class definition so the user can copy-paste it directly to run.\"\n" +
                "}\n" +
                "Error Message / Stack Trace:\n" + (request.getErrorMessage() == null ? "None" : request.getErrorMessage()) + "\n" +
                "Code:\n" + request.getCode();

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdownJson(rawAiResponse);

        DebugResponse response;
        try {
            response = objectMapper.readValue(cleanJson, DebugResponse.class);
            if (response.getSuggestedCode() != null) {
                // Remove double-escaped layout characters
                String fixedCode = response.getSuggestedCode()
                        .replace("\\n", "\n")
                        .replace("\\t", "\t")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
                response.setSuggestedCode(fixedCode);
            }
            
            // Save to MySQL
            DebugSession session = DebugSession.builder()
                    .user(user)
                    .code(request.getCode())
                    .errorLog(request.getErrorMessage() != null ? request.getErrorMessage() : "")
                    .explanation("Root Cause: " + response.getRootCause())
                    .fixStepsJson(cleanJson)
                    .build();
            debugSessionRepository.save(session);
        } catch (Exception e) {
            log.error("Failed to parse AI debugger response", e);
            throw new RuntimeException("AI Debugger formatting failure");
        }

        return response;
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

