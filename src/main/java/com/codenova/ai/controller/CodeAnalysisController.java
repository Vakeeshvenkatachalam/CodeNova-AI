package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.service.CodeAnalysisService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/analysis")
public class CodeAnalysisController {

    @Autowired
    private CodeAnalysisService codeAnalysisService;

    @PostMapping("/explain")
    public ResponseEntity<ExplainResponse> explainCode(
            @Valid @RequestBody CodeRequest request, Principal principal) {
        ExplainResponse response = codeAnalysisService.explainCode(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complexity")
    public ResponseEntity<ComplexityResponse> analyzeComplexity(
            @Valid @RequestBody CodeRequest request, Principal principal) {
        ComplexityResponse response = codeAnalysisService.analyzeComplexity(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/autocomplete")
    public ResponseEntity<AutocompleteResponse> autocomplete(
            @Valid @RequestBody AutocompleteRequest request) {
        AutocompleteResponse response = codeAnalysisService.autocomplete(request);
        return ResponseEntity.ok(response);
    }

    @Autowired
    private com.codenova.ai.service.CodeRunnerService codeRunnerService;

    @PostMapping("/run")
    public ResponseEntity<com.codenova.ai.model.dto.RunCodeResponse> runCode(
            @Valid @RequestBody CodeRequest request) {
        com.codenova.ai.model.dto.RunCodeResponse response = codeRunnerService.runCode(request.getCode(), request.getLanguage());
        return ResponseEntity.ok(response);
    }
}
