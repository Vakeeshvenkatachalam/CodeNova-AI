package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String email;
    private String name;
    private String bio;
    private String preferredLanguage;
    private int level;
    private int totalXp;
    private long problemsSolved;
    private long totalSessions;
}
