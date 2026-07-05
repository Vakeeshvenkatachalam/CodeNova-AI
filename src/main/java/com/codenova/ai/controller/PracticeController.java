package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.PracticeProblem;
import com.codenova.ai.service.PracticeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/practice")
public class PracticeController {

    @Autowired
    private PracticeService practiceService;

    @GetMapping("/problems")
    public ResponseEntity<List<PracticeProblem>> listProblems() {
        List<PracticeProblem> response = practiceService.listProblems();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<PracticeProblem> generateProblem(
            @RequestParam("category") String category,
            @RequestParam("difficulty") String difficulty) {
        PracticeProblem response = practiceService.generateProblem(category, difficulty);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit/{id}")
    public ResponseEntity<PracticeSubmitResponse> submitAttempt(
            @PathVariable("id") Long problemId,
            @Valid @RequestBody PracticeSubmitRequest request,
            Principal principal) {
        PracticeSubmitResponse response = practiceService.submitAttempt(principal.getName(), problemId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/problems/{id}/hint")
    public ResponseEntity<Map<String, String>> getHint(@PathVariable("id") Long problemId) {
        String hintText = practiceService.getHint(problemId);
        return ResponseEntity.ok(Collections.singletonMap("hint", hintText));
    }
}
