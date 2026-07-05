package com.codenova.ai.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "sql_mentor_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SqlMentorHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "query_text", nullable = false, columnDefinition = "TEXT")
    private String queryText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "execution_plan", columnDefinition = "TEXT")
    private String executionPlan;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
