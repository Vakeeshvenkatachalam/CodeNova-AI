package com.codenova.ai.config;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.output.Response;
import com.codenova.ai.exception.AiProviderUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.ArrayList;

public class FallbackChatLanguageModel implements ChatLanguageModel {
    private static final Logger log = LoggerFactory.getLogger(FallbackChatLanguageModel.class);

    private final List<String> modelNames;
    private final String apiKey;
    private final String baseUrl;
    private final double temperature;

    public FallbackChatLanguageModel(List<String> modelNames, String apiKey, String baseUrl, double temperature) {
        if (modelNames == null || modelNames.isEmpty()) {
            throw new IllegalArgumentException("Fallback model names list cannot be empty");
        }
        this.modelNames = modelNames;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl != null ? baseUrl.trim() : "https://openrouter.ai/api/v1";
        this.temperature = temperature;
    }

    private List<OpenAiChatModel> buildDelegateModels() {
        List<OpenAiChatModel> delegates = new ArrayList<>();
        for (String modelName : modelNames) {
            delegates.add(OpenAiChatModel.builder()
                    .apiKey(apiKey)
                    .baseUrl(baseUrl)
                    .modelName(modelName)
                    .temperature(temperature)
                    .build());
        }
        return delegates;
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages) {
        List<OpenAiChatModel> delegates = buildDelegateModels();
        Exception lastException = null;

        for (int i = 0; i < delegates.size(); i++) {
            OpenAiChatModel delegate = delegates.get(i);
            String modelName = modelNames.get(i);
            long start = System.currentTimeMillis();
            log.info("[Fallback Chain] Attempting AI generation with model: {}", modelName);
            try {
                Response<AiMessage> response = delegate.generate(messages);
                long duration = System.currentTimeMillis() - start;
                log.info("[Fallback Chain] Model '{}' succeeded in {}ms", modelName, duration);
                if (response.tokenUsage() != null) {
                    log.info("[Fallback Chain] Token Usage - Input: {}, Output: {}, Total: {}", 
                            response.tokenUsage().inputTokenCount(), 
                            response.tokenUsage().outputTokenCount(), 
                            response.tokenUsage().totalTokenCount());
                }
                return response;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - start;
                log.warn("[Fallback Chain] Model '{}' failed in {}ms. Reason: {}", modelName, duration, e.getMessage());
                lastException = e;
            }
        }

        log.error("[Fallback Chain] All configured AI models failed.");
        throw new AiProviderUnavailableException("All AI models are currently unavailable. Please try again later.", lastException);
    }

    @Override
    public String generate(String userMessage) {
        List<OpenAiChatModel> delegates = buildDelegateModels();
        Exception lastException = null;

        for (int i = 0; i < delegates.size(); i++) {
            OpenAiChatModel delegate = delegates.get(i);
            String modelName = modelNames.get(i);
            long start = System.currentTimeMillis();
            log.info("[Fallback Chain] Attempting AI generation with model: {}", modelName);
            try {
                String response = delegate.generate(userMessage);
                long duration = System.currentTimeMillis() - start;
                log.info("[Fallback Chain] Model '{}' succeeded in {}ms", modelName, duration);
                return response;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - start;
                log.warn("[Fallback Chain] Model '{}' failed in {}ms. Reason: {}", modelName, duration, e.getMessage());
                lastException = e;
            }
        }

        log.error("[Fallback Chain] All configured AI models failed.");
        throw new AiProviderUnavailableException("All AI models are currently unavailable. Please try again later.", lastException);
    }
}
