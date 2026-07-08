package com.nexus.seos.database;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "bio", length = 1000)
    private String bio;

    public Profile() {}

    public Profile(UUID userId, User user, String fullName, String avatarUrl, String bio) {
        this.userId = userId;
        this.user = user;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
