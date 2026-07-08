package com.nexus.seos.database;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(name = "title", nullable = false)
    private String title;

    public Quiz() {}

    public Quiz(UUID id, UUID lessonId, String title) {
        this.id = id;
        this.lessonId = lessonId;
        this.title = title;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getLessonId() {
        return lessonId;
    }

    public void setLessonId(UUID lessonId) {
        this.lessonId = lessonId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
