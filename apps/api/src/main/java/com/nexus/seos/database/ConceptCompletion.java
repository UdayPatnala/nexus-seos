package com.nexus.seos.database;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "concept_completions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "concept_id"})
    }
)
public class ConceptCompletion {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "concept_id", nullable = false)
    private UUID conceptId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt = LocalDateTime.now();

    public ConceptCompletion() {}

    public ConceptCompletion(UUID id, UUID conceptId, UUID userId, LocalDateTime completedAt) {
        this.id = id;
        this.conceptId = conceptId;
        this.userId = userId;
        this.completedAt = completedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getConceptId() {
        return conceptId;
    }

    public void setConceptId(UUID conceptId) {
        this.conceptId = conceptId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
