package com.codenova.ai.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionRequest {

    @NotBlank(message = "Role target must not be blank")
    private String roleTarget; // e.g. 'Backend Engineer', 'React Developer'

    @NotBlank(message = "Difficulty must not be blank")
    private String difficulty; // 'EASY', 'MEDIUM', 'HARD'
}
