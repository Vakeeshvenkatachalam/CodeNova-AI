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
public class InterviewEvaluationRequest {

    @NotBlank(message = "Question text must not be blank")
    private String questionText;

    @NotBlank(message = "User answer must not be blank")
    private String userAnswer;
}
