package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.InterviewQuestion;
import com.codenova.ai.model.entity.InterviewSession;
import com.codenova.ai.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/interview")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @GetMapping("/sessions")
    public ResponseEntity<List<com.codenova.ai.model.entity.InterviewSession>> listSessions(Principal principal) {
        List<com.codenova.ai.model.entity.InterviewSession> response = interviewService.listSessions(principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions")
    public ResponseEntity<InterviewSession> createSession(
            @Valid @RequestBody InterviewSessionRequest request, Principal principal) {
        InterviewSession response = interviewService.createSession(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{id}/question")
    public ResponseEntity<InterviewQuestion> generateQuestion(
            @PathVariable("id") Long sessionId, Principal principal) {
        InterviewQuestion response = interviewService.generateQuestion(sessionId, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/questions/{id}/evaluate")
    public ResponseEntity<InterviewEvaluationResponse> evaluateAnswer(
            @PathVariable("id") Long questionId,
            @Valid @RequestBody InterviewEvaluationRequest request,
            Principal principal) {
        InterviewEvaluationResponse response = interviewService.evaluateAnswer(questionId, principal.getName(), request);
        return ResponseEntity.ok(response);
    }
}
