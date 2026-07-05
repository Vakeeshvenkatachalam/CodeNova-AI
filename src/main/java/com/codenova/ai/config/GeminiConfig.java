package com.codenova.ai.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Bean
    public ChatLanguageModel geminiChatModel() {
        if (apiKey != null && apiKey.trim().startsWith("gsk_")) {
            // Groq API Key
            return OpenAiChatModel.builder()
                    .apiKey(apiKey.trim())
                    .baseUrl("https://api.groq.com/openai/v1")
                    .modelName("llama-3.1-8b-instant")
                    .temperature(0.7)
                    .build();
        } else if (apiKey != null && apiKey.trim().startsWith("sk-or-v1-")) {
            // OpenRouter API Key
            return OpenAiChatModel.builder()
                    .apiKey(apiKey.trim())
                    .baseUrl("https://openrouter.ai/api/v1")
                    .modelName("google/gemini-2.5-flash:free")
                    .temperature(0.7)
                    .build();
        } else if (apiKey != null && apiKey.trim().startsWith("sk-")) {
            // Standard OpenAI API Key
            return OpenAiChatModel.builder()
                    .apiKey(apiKey.trim())
                    .modelName("gpt-4o-mini")
                    .temperature(0.7)
                    .build();
        } else {
            // Standard Gemini API Key
            return GoogleAiGeminiChatModel.builder()
                    .apiKey(apiKey != null ? apiKey.trim() : null)
                    .modelName("gemini-2.0-flash")
                    .temperature(0.7)
                    .build();
        }
    }
}
