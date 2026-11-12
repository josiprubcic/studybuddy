package com.ssz.studybuddy.user;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auth0_id", nullable = false, unique = true, columnDefinition = "text")
    private String auth0Id;

    @Column(nullable = false, columnDefinition = "text")
    private String language = "hr";

    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private boolean parentalConsent;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected User() {
    }

    public User(String auth0Id) {
        this.auth0Id = auth0Id;
    }

    public Long getId() {
        return id;
    }

    public String getAuth0Id() {
        return auth0Id;
    }
}
