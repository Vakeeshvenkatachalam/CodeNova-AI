package com.codenova.ai.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "practice_problems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String difficulty; // 'EASY', 'MEDIUM', 'HARD'

    @Column(nullable = false)
    private String category;

    @Column(name = "starter_code", nullable = false, columnDefinition = "TEXT")
    private String starterCode;

    @Column(name = "solution_code", nullable = false, columnDefinition = "TEXT")
    private String solutionCode;

    @Column(name = "test_cases_json", nullable = false, columnDefinition = "TEXT")
    private String testCasesJson;

    @Column(nullable = false)
    private int points;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
