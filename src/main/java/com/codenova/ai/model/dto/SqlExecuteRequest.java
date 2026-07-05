package com.codenova.ai.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SqlExecuteRequest {
    @NotBlank(message = "SQL query cannot be blank")
    private String sql;
}
