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
public class SqlExecuteResponse {
    private boolean success;
    private List<String> columns;
    private List<List<String>> rows;
    private String errorMessage;
    private int rowCount;
}
