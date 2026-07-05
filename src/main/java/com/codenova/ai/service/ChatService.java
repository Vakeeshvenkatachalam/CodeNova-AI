package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import dev.langchain4j.data.message.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private static final String MENTOR_SYSTEM_PROMPT = 
            "You are CodeNova AI, a patient and expert programming mentor. Your mission is to guide students through coding concepts, algorithms, and debugging.\n" +
            "You MUST follow these pedagogical rules:\n" +
            "1. Do NOT directly write the complete solution code for the student.\n" +
            "2. Break down complex challenges into step-by-step logical instructions.\n" +
            "3. Provide targeted clues, point out syntax mistakes, or ask guiding questions (e.g. \"What would happen if the array is empty?\").\n" +
            "4. If the student explicitly demands the code after trying, you may output the code block, explaining its execution.\n" +
            "5. Format code blocks using Markdown and include language tags.\n" +
            "6. If you are unsure of an answer, admit it. Do not hallucinate or make up APIs.";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatLanguageModel chatLanguageModel;

    @Transactional
    public ConversationResponse createConversation(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        Conversation conv = Conversation.builder()
                .user(user)
                .title("New Mentorship Chat")
                .build();
        conversationRepository.save(conv);

        log.info("Created new conversation session ID: {} for user: {}", conv.getId(), email);

        return ConversationResponse.builder()
                .id(conv.getId())
                .title(conv.getTitle())
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> listConversations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        List<Conversation> conversations = conversationRepository.findByUserOrderByUpdatedAtDesc(user);
        return conversations.stream()
                .map(conv -> ConversationResponse.builder()
                        .id(conv.getId())
                        .title(conv.getTitle())
                        .createdAt(conv.getCreatedAt())
                        .updatedAt(conv.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long convId, String email) {
        Conversation conv = getValidatedConversation(convId, email);

        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conv);
        return messages.stream()
                .map(msg -> MessageResponse.builder()
                        .id(msg.getId())
                        .sender(msg.getSender())
                        .content(msg.getContent())
                        .createdAt(msg.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(Long convId, String email, String userContent) {
        Conversation conv = getValidatedConversation(convId, email);

        // 1. Save USER message to database
        Message userMsg = Message.builder()
                .conversation(conv)
                .sender("USER")
                .content(userContent)
                .build();
        messageRepository.save(userMsg);

        // 2. Fetch last 10 messages from DB to build the trimmed context (Context Window Management)
        List<Message> dbMessagesDesc = messageRepository.findTop10ByConversationOrderByCreatedAtDesc(conv);
        List<Message> contextMessages = new ArrayList<>(dbMessagesDesc);
        Collections.reverse(contextMessages); // Restore chronological order

        // 3. Map context messages to LangChain4j ChatMessage types
        List<ChatMessage> langchainMessages = new ArrayList<>();
        langchainMessages.add(SystemMessage.from(MENTOR_SYSTEM_PROMPT));

        for (Message msg : contextMessages) {
            if ("USER".equalsIgnoreCase(msg.getSender())) {
                langchainMessages.add(UserMessage.from(msg.getContent()));
            } else {
                langchainMessages.add(AiMessage.from(msg.getContent()));
            }
        }

        // 4. Query Gemini via LangChain4j ChatLanguageModel
        String aiResponseText;
        try {
            aiResponseText = chatLanguageModel.generate(langchainMessages).content().text();
        } catch (Exception e) {
            log.error("Failed to query Gemini AI for conversation ID: {}", convId, e);
            aiResponseText = "The AI Coding Mentor is temporarily experiencing heavy traffic. Let's try typing your request again.";
        }

        // 5. Save AI response message to database
        Message aiMsg = Message.builder()
                .conversation(conv)
                .sender("AI")
                .content(aiResponseText)
                .build();
        messageRepository.save(aiMsg);

        // Update conversation modified time so it bubbles up to the top of the sidebar list
        conv.setUpdatedAt(Instant.now());
        
        // Auto update conversation title if it is still the default name
        if ("New Mentorship Chat".equals(conv.getTitle())) {
            String shortTitle = userContent.length() > 25 ? userContent.substring(0, 22) + "..." : userContent;
            conv.setTitle(shortTitle);
        }
        conversationRepository.save(conv);

        return MessageResponse.builder()
                .id(aiMsg.getId())
                .sender(aiMsg.getSender())
                .content(aiMsg.getContent())
                .createdAt(aiMsg.getCreatedAt())
                .build();
    }

    private Conversation getValidatedConversation(Long convId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        Conversation conv = conversationRepository.findById(convId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conv.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied to conversation session");
        }

        return conv;
    }
}
