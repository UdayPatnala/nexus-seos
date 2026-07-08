package com.nexus.seos.database;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "quiz_id", nullable = false)
    private UUID quizId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "score")
    private Double score;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    public QuizAttempt() {}

    public QuizAttempt(UUID id, UUID quizId, UUID userId, Double score, LocalDateTime submittedAt) {
        this.id = id;
        this.quizId = quizId;
        this.userId = userId;
        this.score = score;
        this.submittedAt = submittedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getQuizId() {
        return quizId;
    }

    public void setQuizId(UUID quizId) {
        this.quizId = quizId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
