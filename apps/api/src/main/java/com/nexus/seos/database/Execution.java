package com.nexus.seos.database;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "executions")
public class Execution {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "language")
    private String language;

    @Column(name = "status")
    private String status; // RUNNING, SUCCESS, ERROR

    @Column(name = "stdout", length = 10000)
    private String stdout;

    @Column(name = "stderr", length = 10000)
    private String stderr;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Execution() {}

    public Execution(UUID id, UUID projectId, String language, String status, String stdout, String stderr, LocalDateTime createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.language = language;
        this.status = status;
        this.stdout = stdout;
        this.stderr = stderr;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }

    public String getStderr() {
        return stderr;
    }

    public void setStderr(String stderr) {
        this.stderr = stderr;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
