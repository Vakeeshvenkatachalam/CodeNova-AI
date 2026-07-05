package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import com.codenova.ai.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private StreakRepository streakRepository;

    @Mock
    private UserProgressRepository userProgressRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private AuthRequest authRequest;
    private User user;

    @BeforeEach
    public void setUp() {
        authRequest = AuthRequest.builder()
                .email("vikas@codenova.com")
                .password("Password123!")
                .build();

        user = User.builder()
                .id(1L)
                .email("vikas@codenova.com")
                .passwordHash("hashedPassword")
                .role("ROLE_USER")
                .build();
    }

    @Test
    public void testRegisterSuccess() {
        when(userRepository.existsByEmail(authRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(authRequest.getPassword())).thenReturn("hashedPassword");

        authService.register(authRequest);

        verify(userRepository, times(1)).save(any(User.class));
        verify(streakRepository, times(1)).save(any(Streak.class));
        verify(userProgressRepository, times(1)).save(any(UserProgress.class));
    }

    @Test
    public void testRegisterDuplicateEmailThrowsException() {
        when(userRepository.existsByEmail(authRequest.getEmail())).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> authService.register(authRequest));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    public void testLoginSuccess() {
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())).thenReturn(true);
        when(tokenProvider.generateAccessToken(user.getEmail(), user.getRole())).thenReturn("accessToken");
        when(tokenProvider.generateRefreshToken()).thenReturn("refreshToken");

        AuthResponse response = authService.login(authRequest);

        assertNotNull(response);
        assertEquals("accessToken", response.getToken());
        assertEquals(user.getEmail(), response.getEmail());
        assertEquals(user.getRole(), response.getRole());

        verify(refreshTokenRepository, times(1)).deleteByUser(user);
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    public void testLoginBadCredentialsThrowsException() {
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())).thenReturn(false);

        assertThrows(SecurityException.class, () -> authService.login(authRequest));
    }
}
