package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.service.SqlMentorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/sql")
public class SqlMentorController {

    @Autowired
    private SqlMentorService sqlMentorService;

    @PostMapping("/generate")
    public ResponseEntity<SqlGenerateResponse> generateSql(
            @Valid @RequestBody SqlGenerateRequest request, Principal principal) {
        SqlGenerateResponse response = sqlMentorService.generateSql(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/review")
    public ResponseEntity<SqlReviewResponse> reviewSql(
            @Valid @RequestBody SqlReviewRequest request, Principal principal) {
        SqlReviewResponse response = sqlMentorService.reviewSql(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/execute")
    public ResponseEntity<SqlExecuteResponse> executeSql(
            @Valid @RequestBody SqlExecuteRequest request, Principal principal) {
        SqlExecuteResponse response = sqlMentorService.executeSql(principal.getName(), request);
        return ResponseEntity.ok(response);
    }
}
