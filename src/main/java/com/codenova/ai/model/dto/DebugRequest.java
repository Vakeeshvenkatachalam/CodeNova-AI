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
public class DebugRequest {

    @NotBlank(message = "Code must not be blank")
    private String code;

    private String errorMessage;
}
