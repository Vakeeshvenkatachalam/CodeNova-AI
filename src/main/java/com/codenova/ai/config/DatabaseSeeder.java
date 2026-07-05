package com.codenova.ai.config;

import com.codenova.ai.model.entity.*;
import com.codenova.ai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed default Student user if not exists
        if (!userRepository.existsByEmail("student@codenova.ai")) {
            log.info("Seeding default demo student account: student@codenova.ai");
            User student = User.builder()
                    .email("student@codenova.ai")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role("ROLE_USER")
                    .name("Demo Student")
                    .bio("Aspiring full-stack software engineer learning Java and Python.")
                    .preferredLanguage("Java")
                    .build();
            userRepository.save(student);

            streakRepository.save(Streak.builder()
                    .user(student)
                    .currentStreak(3)
                    .maxStreak(5)
                    .build());

            userProgressRepository.save(UserProgress.builder()
                    .user(student)
                    .totalXp(340)
                    .level(3)
                    .modulesCompletedJson("[]")
                    .build());
        }

        // Seed default Admin user if not exists
        if (!userRepository.existsByEmail("admin@codenova.ai")) {
            log.info("Seeding default administrator account: admin@codenova.ai");
            User admin = User.builder()
                    .email("admin@codenova.ai")
                    .passwordHash(passwordEncoder.encode("adminpassword"))
                    .role("ROLE_ADMIN")
                    .name("Platform Admin")
                    .bio("System administrator for CodeNova AI tutoring platform.")
                    .preferredLanguage("Java")
                    .build();
            userRepository.save(admin);

            streakRepository.save(Streak.builder()
                    .user(admin)
                    .currentStreak(0)
                    .maxStreak(0)
                    .build());

            userProgressRepository.save(UserProgress.builder()
                    .user(admin)
                    .totalXp(0)
                    .level(1)
                    .modulesCompletedJson("[]")
                    .build());
        }
    }
}
