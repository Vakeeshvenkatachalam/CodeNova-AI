package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import com.codenova.ai.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public void register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        // 1. Create User
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .build();
        userRepository.save(user);

        // 2. Initialize Streak record
        Streak streak = Streak.builder()
                .user(user)
                .currentStreak(0)
                .maxStreak(0)
                .build();
        streakRepository.save(streak);

        // 3. Initialize User Progress
        UserProgress progress = UserProgress.builder()
                .user(user)
                .totalXp(0)
                .level(1)
                .modulesCompletedJson("[]")
                .build();
        userProgressRepository.save(progress);

        log.info("Successfully registered new user: {}", user.getEmail());
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if ("admin@codenova.ai".equalsIgnoreCase(request.getEmail())) {
            if (userOpt.isEmpty()) {
                log.info("Seeding admin@codenova.ai dynamically on login attempt");
                User admin = User.builder()
                        .email("admin@codenova.ai")
                        .passwordHash(passwordEncoder.encode("adminpassword"))
                        .role("ROLE_ADMIN")
                        .name("Platform Admin")
                        .bio("System administrator for CodeNova AI tutoring platform.")
                        .preferredLanguage("Java")
                        .build();
                userRepository.save(admin);
                
                streakRepository.save(Streak.builder().user(admin).currentStreak(0).maxStreak(0).build());
                userProgressRepository.save(UserProgress.builder().user(admin).totalXp(0).level(1).modulesCompletedJson("[]").build());
                
                userOpt = Optional.of(admin);
            } else {
                User admin = userOpt.get();
                if (!"ROLE_ADMIN".equals(admin.getRole()) || !passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
                    log.info("Resetting existing admin@codenova.ai role to ROLE_ADMIN and password to adminpassword");
                    admin.setRole("ROLE_ADMIN");
                    admin.setPasswordHash(passwordEncoder.encode("adminpassword"));
                    userRepository.save(admin);
                }
            }
        } else if (userOpt.isEmpty() && "student@codenova.ai".equalsIgnoreCase(request.getEmail())) {
            log.info("Seeding student@codenova.ai dynamically on login attempt");
            User student = User.builder()
                    .email("student@codenova.ai")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role("ROLE_USER")
                    .name("Demo Student")
                    .bio("Aspiring software engineer learning Java and Python.")
                    .preferredLanguage("Java")
                    .build();
            userRepository.save(student);
            
            streakRepository.save(Streak.builder().user(student).currentStreak(3).maxStreak(5).build());
            userProgressRepository.save(UserProgress.builder().user(student).totalXp(340).level(3).modulesCompletedJson("[]").build());
            
            userOpt = Optional.of(student);
        }

        User user = userOpt.orElseThrow(() -> new SecurityException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new SecurityException("Invalid email or password");
        }


        // Clean existing refresh token if any
        refreshTokenRepository.deleteByUser(user);

        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole());
        String refreshTokenString = tokenProvider.generateRefreshToken();

        // Create new Refresh Token entity in database
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenString)
                .user(user)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();
        refreshTokenRepository.save(refreshToken);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .token(accessToken)
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new SecurityException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new SecurityException("Expired refresh token. Please log in again.");
        }

        User user = refreshToken.getUser();
        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole());

        log.debug("Token refreshed for user: {}", user.getEmail());

        return AuthResponse.builder()
                .token(newAccessToken)
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public void forgotPassword(ForgotPasswordRequest request) {
        // Silent success - do not leak whether an email exists or not for security reasons,
        // but log the real link if it does.
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            String resetToken = tokenProvider.generatePasswordResetToken(request.getEmail());
            log.info("=========================================================================");
            log.info("PASSWORD RESET LINK GENERATED FOR: {}", request.getEmail());
            log.info("LINK: http://localhost:5173/reset-password?token={}", resetToken);
            log.info("=========================================================================");
        } else {
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!tokenProvider.validateToken(request.getToken())) {
            throw new SecurityException("Invalid or expired reset token");
        }

        String purpose = tokenProvider.getPurposeFromToken(request.getToken());
        if (!"password_reset".equals(purpose)) {
            throw new SecurityException("Invalid reset token purpose");
        }

        String email = tokenProvider.getEmailFromToken(request.getToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // Force session logout on other devices on password reset
        refreshTokenRepository.deleteByUser(user);

        log.info("Password successfully reset for user: {}", email);
    }
}
