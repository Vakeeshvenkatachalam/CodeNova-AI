package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kb")
public class KnowledgeBaseController {

    @Autowired
    private KnowledgeBaseService knowledgeBaseService;

    @PostMapping("/documents")
    public ResponseEntity<KbDocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file, Principal principal) {
        KbDocumentResponse response = knowledgeBaseService.uploadDocument(principal.getName(), file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents")
    public ResponseEntity<List<KbDocumentResponse>> listDocuments(Principal principal) {
        List<KbDocumentResponse> response = knowledgeBaseService.listDocuments(principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable("id") Long id, Principal principal) {
        knowledgeBaseService.deleteDocument(id, principal.getName());
        return ResponseEntity.ok(Collections.singletonMap("message", "Document deleted successfully"));
    }

    @PostMapping("/documents/{id}/chat")
    public ResponseEntity<KbChatResponse> chatWithPdf(
            @PathVariable("id") Long docId,
            @Valid @RequestBody KbChatRequest request,
            Principal principal) {
        KbChatResponse response = knowledgeBaseService.chatWithPdf(docId, principal.getName(), request);
        return ResponseEntity.ok(response);
    }
}
