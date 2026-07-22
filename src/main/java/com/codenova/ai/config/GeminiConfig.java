package com.codenova.ai.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class GeminiConfig {

    @Value("${openrouter.api.key:}")
    private String openrouterApiKey;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${openrouter.models:deepseek/deepseek-r1:free,qwen/qwen-2.5-72b-instruct:free,meta-llama/llama-3.3-70b-instruct:free}")
    private String rawModelNames;

    @Value("${openrouter.temperature:0.7}")
    private double temperature;

    @Bean
    public ChatLanguageModel geminiChatModel() {
        // Resolve the active API key (prefer OpenRouter key, fallback to Gemini key if OpenRouter is empty)
        String activeKey = (openrouterApiKey != null && !openrouterApiKey.trim().isEmpty())
                ? openrouterApiKey.trim()
                : (geminiApiKey != null ? geminiApiKey.trim() : "");

        List<String> modelNamesList = new java.util.ArrayList<>();
        if (rawModelNames != null && !rawModelNames.trim().isEmpty()) {
            for (String model : rawModelNames.split(",")) {
                if (!model.trim().isEmpty()) {
                    modelNamesList.add(model.trim());
                }
            }
        }

        // Instantiate and return our custom Fallback chain
        return new FallbackChatLanguageModel(
                modelNamesList,
                activeKey,
                "https://openrouter.ai/api/v1",
                temperature
        );
    }
}
