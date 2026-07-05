package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.service.DebugService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/debug")
public class DebugController {

    @Autowired
    private DebugService debugService;

    @PostMapping("/analyze")
    public ResponseEntity<DebugResponse> analyzeBug(
            @Valid @RequestBody DebugRequest request, Principal principal) {
        DebugResponse response = debugService.analyzeBug(principal.getName(), request);
        return ResponseEntity.ok(response);
    }
}
