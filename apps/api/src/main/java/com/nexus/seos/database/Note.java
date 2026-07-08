package com.nexus.seos.database;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notes")
public class Note {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "concept_id")
    private UUID conceptId;

    @Column(name = "markdown", length = 10000)
    private String markdown;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Note() {}

    public Note(UUID id, UUID userId, UUID conceptId, String markdown, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.conceptId = conceptId;
        this.markdown = markdown;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getConceptId() {
        return conceptId;
    }

    public void setConceptId(UUID conceptId) {
        this.conceptId = conceptId;
    }

    public String getMarkdown() {
        return markdown;
    }

    public void setMarkdown(String markdown) {
        this.markdown = markdown;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
