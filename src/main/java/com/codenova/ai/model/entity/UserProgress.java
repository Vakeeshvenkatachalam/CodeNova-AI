package com.codenova.ai.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_xp", nullable = false)
    private int totalXp;

    @Column(nullable = false)
    private int level;

    @Column(name = "modules_completed_json", columnDefinition = "TEXT")
    private String modulesCompletedJson;

    @Column(name = "last_insight_text", columnDefinition = "TEXT")
    private String lastInsightText;

    @Column(name = "last_insight_generated_at")
    private java.time.Instant lastInsightGeneratedAt;
}
