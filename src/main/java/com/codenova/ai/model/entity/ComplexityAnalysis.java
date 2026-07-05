package com.codenova.ai.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "complexity_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplexityAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(name = "time_complexity", nullable = false)
    private String timeComplexity;

    @Column(name = "space_complexity", nullable = false)
    private String spaceComplexity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
