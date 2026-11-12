package com.ssz.studybuddy.document;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, columnDefinition = "text")
    private String name;

    @Column(nullable = false, columnDefinition = "text")
    private String type;

    @Column(columnDefinition = "text")
    private String language;

    @Column(nullable = false, columnDefinition = "text")
    private String markdown;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Document() {
    }

    public Document(Long userId, String name, String type, String markdown) {
        this.userId = userId;
        this.name = name;
        this.type = type;
        this.markdown = markdown;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getMarkdown() {
        return markdown;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
