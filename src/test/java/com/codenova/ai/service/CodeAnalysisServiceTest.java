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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CodeAnalysisServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CodeAnalysisRepository codeAnalysisRepository;

    @Mock
    private ComplexityAnalysisRepository complexityAnalysisRepository;

    @Mock
    private ChatLanguageModel chatLanguageModel;

    @InjectMocks
    private CodeAnalysisService codeAnalysisService;

    private User user;
    private CodeRequest codeRequest;

    @BeforeEach
    public void setUp() {
        user = User.builder()
                .id(1L)
                .email("vikas@codenova.com")
                .role("ROLE_USER")
                .build();

        codeRequest = CodeRequest.builder()
                .code("for(int i=0; i<10; i++) {}")
                .language("Java")
                .build();
    }

    @Test
    public void testExplainCodeSuccess() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        
        // Mock JSON response matching ExplainResponse format
        String mockJsonResponse = "{\n" +
                "  \"explanations\": [\n" +
                "    { \"block\": \"for(int i=0;...\", \"explanation\": \"Loops ten times\" }\n" +
                "  ]\n" +
                "}";
        when(chatLanguageModel.generate(anyString())).thenReturn(mockJsonResponse);

        ExplainResponse response = codeAnalysisService.explainCode(user.getEmail(), codeRequest);

        assertNotNull(response);
        assertEquals(1, response.getExplanations().size());
        assertEquals("Loops ten times", response.getExplanations().get(0).getExplanation());

        verify(codeAnalysisRepository, times(1)).save(any(CodeAnalysis.class));
    }

    @Test
    public void testAnalyzeComplexitySuccess() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        String mockJsonResponse = "{\n" +
                "  \"timeComplexity\": \"O(N)\",\n" +
                "  \"spaceComplexity\": \"O(1)\",\n" +
                "  \"justification\": \"Iterates input once\"\n" +
                "}";
        when(chatLanguageModel.generate(anyString())).thenReturn(mockJsonResponse);

        ComplexityResponse response = codeAnalysisService.analyzeComplexity(user.getEmail(), codeRequest);

        assertNotNull(response);
        assertEquals("O(N)", response.getTimeComplexity());
        assertEquals("O(1)", response.getSpaceComplexity());

        verify(complexityAnalysisRepository, times(1)).save(any(ComplexityAnalysis.class));
    }

    @Test
    public void testAutocompleteSuccess() {
        AutocompleteRequest request = AutocompleteRequest.builder()
                .codeBeforeCursor("System.out.pri")
                .language("Java")
                .build();

        String mockJsonResponse = "{\n" +
                "  \"suggestion\": \"ntln(\\\"Hello\\\");\"\n" +
                "}";
        when(chatLanguageModel.generate(anyString())).thenReturn(mockJsonResponse);

        AutocompleteResponse response = codeAnalysisService.autocomplete(request);

        assertNotNull(response);
        assertEquals("ntln(\"Hello\");", response.getSuggestion());
    }
}
