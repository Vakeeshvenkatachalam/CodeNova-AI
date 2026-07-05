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
public class SqlReviewRequest {

    @NotBlank(message = "Prompt context must not be blank")
    private String prompt;

    @NotBlank(message = "SQL query to review must not be blank")
    private String userSql;
}
