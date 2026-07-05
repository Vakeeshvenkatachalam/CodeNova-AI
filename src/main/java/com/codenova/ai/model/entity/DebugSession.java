package com.codenova.ai.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "debug_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebugSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(name = "error_log", nullable = false, columnDefinition = "TEXT")
    private String errorLog;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "fix_steps_json", nullable = false, columnDefinition = "TEXT")
    private String fixStepsJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
