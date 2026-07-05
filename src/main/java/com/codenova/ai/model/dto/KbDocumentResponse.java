package com.codenova.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbDocumentResponse {
    private Long id;
    private String filename;
    private String fileType;
    private long fileSize;
    private Instant uploadedAt;
}
