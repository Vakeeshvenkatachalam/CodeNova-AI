package com.codenova.ai.exception;

public class AiProviderUnavailableException extends Error {
    public AiProviderUnavailableException(String message) {
        super(message);
    }

    public AiProviderUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
