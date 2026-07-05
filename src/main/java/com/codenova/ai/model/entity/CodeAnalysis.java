package com.codenova.ai.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "code_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(nullable = false)
    private String language;

    @Column(name = "quality_score", nullable = false)
    private int qualityScore;

    @Column(name = "metrics_json", nullable = false, columnDefinition = "TEXT")
    private String metricsJson;

    @Column(name = "recommendations_json", nullable = false, columnDefinition = "TEXT")
    private String recommendationsJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
