package com.codenova.ai.service;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Progress details not seeded"));

        long solvedCount = submissionRepository.countByUserAndStatus(user, "PASSED");
        long chatCount = conversationRepository.countByUser(user);

        return UserProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .bio(user.getBio())
                .preferredLanguage(user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "Java")
                .level(progress.getLevel())
                .totalXp(progress.getTotalXp())
                .problemsSolved(solvedCount)
                .totalSessions(chatCount)
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UserProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getPreferredLanguage() != null) {
            user.setPreferredLanguage(request.getPreferredLanguage().trim());
        }

        userRepository.save(user);

        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Progress details not seeded"));

        long solvedCount = submissionRepository.countByUserAndStatus(user, "PASSED");
        long chatCount = conversationRepository.countByUser(user);

        return UserProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .bio(user.getBio())
                .preferredLanguage(user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "Java")
                .level(progress.getLevel())
                .totalXp(progress.getTotalXp())
                .problemsSolved(solvedCount)
                .totalSessions(chatCount)
                .build();
    }
}
