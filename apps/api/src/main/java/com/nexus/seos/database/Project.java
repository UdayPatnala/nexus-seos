package com.nexus.seos.database;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "visibility")
    private String visibility = "PRIVATE"; // PUBLIC, PRIVATE

    public Project() {}

    public Project(UUID id, UUID userId, String name, String visibility) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.visibility = visibility;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
