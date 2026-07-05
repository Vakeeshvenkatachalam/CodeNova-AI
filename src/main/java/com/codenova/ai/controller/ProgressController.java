package com.codenova.ai.controller;

import com.codenova.ai.model.dto.ProgressResponse;
import com.codenova.ai.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping("/summary")
    public ResponseEntity<ProgressResponse> getProgress(Principal principal) {
        ProgressResponse response = progressService.getProgress(principal.getName());
        return ResponseEntity.ok(response);
    }
}
