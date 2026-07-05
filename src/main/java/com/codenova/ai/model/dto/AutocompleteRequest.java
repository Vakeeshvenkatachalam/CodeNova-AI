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
public class AutocompleteRequest {

    @NotBlank(message = "Code context must not be blank")
    private String codeBeforeCursor;

    @NotBlank(message = "Language must not be blank")
    private String language;
}
