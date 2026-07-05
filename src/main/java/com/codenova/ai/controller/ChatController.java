package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(Principal principal) {
        ConversationResponse response = chatService.createConversation(principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> listConversations(Principal principal) {
        List<ConversationResponse> response = chatService.listConversations(principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable("id") Long convId, Principal principal) {
        List<MessageResponse> response = chatService.getMessages(convId, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable("id") Long convId,
            @Valid @RequestBody MessageRequest request,
            Principal principal) {
        MessageResponse response = chatService.sendMessage(convId, principal.getName(), request.getContent());
        return ResponseEntity.ok(response);
    }
}
