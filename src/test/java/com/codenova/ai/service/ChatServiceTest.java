package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.output.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatLanguageModel chatLanguageModel;

    @InjectMocks
    private ChatService chatService;

    private User user;
    private Conversation conversation;
    private List<Message> messages;

    @BeforeEach
    public void setUp() {
        user = User.builder()
                .id(1L)
                .email("vikas@codenova.com")
                .role("ROLE_USER")
                .build();

        conversation = Conversation.builder()
                .id(100L)
                .user(user)
                .title("New Mentorship Chat")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        messages = new ArrayList<>();
        messages.add(Message.builder().id(1L).conversation(conversation).sender("USER").content("Hello").createdAt(Instant.now()).build());
        messages.add(Message.builder().id(2L).conversation(conversation).sender("AI").content("Hi, I am your mentor").createdAt(Instant.now()).build());
    }

    @Test
    public void testCreateConversationSuccess() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(i -> i.getArgument(0));

        ConversationResponse response = chatService.createConversation(user.getEmail());

        assertNotNull(response);
        assertEquals("New Mentorship Chat", response.getTitle());
        verify(conversationRepository, times(1)).save(any(Conversation.class));
    }

    @Test
    public void testSendMessageSuccess() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(conversationRepository.findById(100L)).thenReturn(Optional.of(conversation));
        when(messageRepository.findTop10ByConversationOrderByCreatedAtDesc(conversation)).thenReturn(messages);
        when(chatLanguageModel.generate(anyList())).thenReturn(Response.from(AiMessage.from("Sure, I can help you with binary search trees!")));

        MessageResponse response = chatService.sendMessage(100L, user.getEmail(), "Explain BST");

        assertNotNull(response);
        assertEquals("AI", response.getSender());
        assertEquals("Sure, I can help you with binary search trees!", response.getContent());
        
        // Verifies the auto-updating title logic
        assertEquals("Explain BST", conversation.getTitle());

        verify(messageRepository, times(2)).save(any(Message.class));
        verify(conversationRepository, times(1)).save(conversation);
    }
}
