package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class KnowledgeBaseServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UploadedDocumentRepository uploadedDocumentRepository;

    @Mock
    private ChatLanguageModel chatLanguageModel;

    @InjectMocks
    private KnowledgeBaseService knowledgeBaseService;

    private User user;
    private UploadedDocument document;

    @BeforeEach
    public void setUp() {
        user = User.builder()
                .id(1L)
                .email("vikas@codenova.com")
                .role("ROLE_USER")
                .build();

        document = UploadedDocument.builder()
                .id(500L)
                .user(user)
                .fileName("syllabus.pdf")
                .chromaCollectionId("uploads/mock_syllabus.pdf")
                .fileType("PDF")
                .fileSize(1024L)
                .build();
    }

    @Test
    public void testChatWithPdfGroundedAnswer() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(uploadedDocumentRepository.findById(500L)).thenReturn(Optional.of(document));
        
        // Mock Gemini response returning grounded output
        when(chatLanguageModel.generate(anyString())).thenReturn("This class covers Java Spring Boot and React. [Page 1]");

        KbChatRequest request = KbChatRequest.builder()
                .question("What does this class cover?")
                .build();

        KbChatResponse response = knowledgeBaseService.chatWithPdf(500L, user.getEmail(), request);

        assertNotNull(response);
        assertEquals("This class covers Java Spring Boot and React. [Page 1]", response.getAnswer());
    }

    @Test
    public void testChatWithPdfFallbackNotFound() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(uploadedDocumentRepository.findById(500L)).thenReturn(Optional.of(document));
        
        // Mock Gemini response indicating the question is out of scope (as instructed by system prompt!)
        when(chatLanguageModel.generate(anyString())).thenReturn("Information not found in this document.");

        KbChatRequest request = KbChatRequest.builder()
                .question("When is the final exam?")
                .build();

        KbChatResponse response = knowledgeBaseService.chatWithPdf(500L, user.getEmail(), request);

        assertNotNull(response);
        assertEquals("Information not found in this document.", response.getAnswer());
    }
}
