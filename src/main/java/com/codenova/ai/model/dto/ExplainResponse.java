package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplainResponse {
    private List<ExplanationBlock> explanations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExplanationBlock {
        private String block;
        private String explanation;
    }
}
