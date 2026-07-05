package com.codenova.ai.config;

import com.codenova.ai.service.RateLimitingService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RateLimitingFilter implements Filter {

    @Autowired
    private RateLimitingService rateLimitingService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        
        // Apply rate limits to AI, practice, chat, and authentication endpoints
        if (path.contains("/api/v1/ai") || path.contains("/api/v1/practice") || path.contains("/api/v1/chat") || path.contains("/api/v1/auth/login")) {
            String clientIp = getClientIP(httpRequest);
            
            if (!rateLimitingService.tryConsume(clientIp)) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
                httpResponse.getWriter().write(
                        "{\"timestamp\":\"" + java.time.Instant.now() + "\","
                        + "\"status\":429,"
                        + "\"error\":\"Too Many Requests\","
                        + "\"message\":\"You have exceeded your request quota. Please wait a minute and try again.\","
                        + "\"path\":\"" + path + "\"}"
                );
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
