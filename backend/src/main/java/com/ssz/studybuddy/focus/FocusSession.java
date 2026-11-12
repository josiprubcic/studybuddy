package com.ssz.studybuddy.focus;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "focus_sessions")
public class FocusSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, columnDefinition = "text")
    private String type;

    @Column(nullable = false)
    private Instant startedAt;

    @Column(nullable = false)
    private int durationSeconds;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected FocusSession() {
    }

    public FocusSession(Long userId, String type, Instant startedAt, int durationSeconds, boolean completed) {
        this.userId = userId;
        this.type = type;
        this.startedAt = startedAt;
        this.durationSeconds = durationSeconds;
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }

    public boolean isCompleted() {
        return completed;
    }
}
