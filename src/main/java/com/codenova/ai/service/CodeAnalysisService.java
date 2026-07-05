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
public class CodeAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(CodeAnalysisService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CodeAnalysisRepository codeAnalysisRepository;

    @Autowired
    private ComplexityAnalysisRepository complexityAnalysisRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ExplainResponse explainCode(String email, CodeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        String prompt = "You are a senior code reviewer. Explain the following " + request.getLanguage() + " code block-by-block.\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"explanations\": [\n" +
                "    { \"block\": \"code segment\", \"explanation\": \"natural language explanation\" }\n" +
                "  ]\n" +
                "}\n" +
                "Code:\n" + request.getCode();

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdown(rawAiResponse);

        ExplainResponse response;
        try {
            response = objectMapper.readValue(cleanJson, ExplainResponse.class);
            
            // Save log to MySQL
            CodeAnalysis logEntry = CodeAnalysis.builder()
                    .user(user)
                    .code(request.getCode())
                    .language(request.getLanguage())
                    .qualityScore(100)
                    .metricsJson(cleanJson)
                    .recommendationsJson("[]")
                    .build();
            codeAnalysisRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to parse code explanation response", e);
            throw new RuntimeException("AI Explanation formatting failure");
        }

        return response;
    }

    @Transactional
    public ComplexityResponse analyzeComplexity(String email, CodeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        String prompt = "You are an expert algorithms profile manager. Estimate time and space complexity of the code (Big-O notation).\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"timeComplexity\": \"O(N)\",\n" +
                "  \"spaceComplexity\": \"O(1)\",\n" +
                "  \"justification\": \"Detailed reasoning why...\"\n" +
                "}\n" +
                "Code:\n" + request.getCode();

        String rawAiResponse = chatLanguageModel.generate(prompt);
        String cleanJson = cleanMarkdown(rawAiResponse);

        ComplexityResponse response;
        try {
            response = objectMapper.readValue(cleanJson, ComplexityResponse.class);
            
            // Save log or update active log
            ComplexityAnalysis logEntry = ComplexityAnalysis.builder()
                    .user(user)
                    .code(request.getCode())
                    .timeComplexity(response.getTimeComplexity())
                    .spaceComplexity(response.getSpaceComplexity())
                    .explanation("Big-O Run: " + response.getJustification())
                    .build();
            complexityAnalysisRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to parse code complexity response", e);
            throw new RuntimeException("AI Complexity formatting failure");
        }

        return response;
    }

    public AutocompleteResponse autocomplete(AutocompleteRequest request) {
        String prompt = "You are an AI programming assistant for beginners. Suggest the next 1-3 logical lines of code to write based on the current code context.\n" +
                "Include a single comment line directly above the code suggestion explaining why it is added (e.g. '// Initialize loop index variables' or '// Declare standard console logger').\n" +
                "If the code context is very short (e.g. empty or just a class definition), suggest the next standard block (like a main method, class constructor, or method header).\n" +
                "Ensure your suggestion matches the syntax of the language, respects indentation, and helps a beginner progress.\n" +
                "You MUST output strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"suggestion\": \"// Explanation comment here\\ncode_to_append_here\"\n" +
                "}\n" +
                "Do NOT include any markdown code block wrappers inside the suggestion field. ONLY the raw lines of code with the explanation comment above it.\n" +
                "Language: " + request.getLanguage() + "\n" +
                "Code Context:\n" + request.getCodeBeforeCursor();

        try {
            String rawAiResponse = chatLanguageModel.generate(prompt);
            String cleanJson = cleanMarkdown(rawAiResponse);
            AutocompleteResponse response = objectMapper.readValue(cleanJson, AutocompleteResponse.class);
            if (response.getSuggestion() != null) {
                // Remove double-escaped layout characters
                String fixedSuggestion = response.getSuggestion()
                        .replace("\\n", "\n")
                        .replace("\\t", "\t")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
                response.setSuggestion(fixedSuggestion);
            }
            return response;
        } catch (Exception e) {
            log.warn("Autocomplete query failed: {}", e.getMessage());
            return AutocompleteResponse.builder().suggestion("").build(); // Silent return
        }
    }

    private String cleanMarkdown(String text) {
        if (text == null) return "";
        String trimmed = text.trim();
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
