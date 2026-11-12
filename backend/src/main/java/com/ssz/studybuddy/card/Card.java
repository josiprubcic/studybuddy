package com.ssz.studybuddy.card;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long chunkId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, columnDefinition = "text")
    private String type;

    @Column(nullable = false, columnDefinition = "text")
    private String question;

    @Column(nullable = false, columnDefinition = "text")
    private String answer;

    @Column(nullable = false, columnDefinition = "text")
    private String quote;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Card() {
    }

    public Card(Long chunkId, Long userId, String type, String question, String answer, String quote) {
        this.chunkId = chunkId;
        this.userId = userId;
        this.type = type;
        this.question = question;
        this.answer = answer;
        this.quote = quote;
    }

    public Long getId() {
        return id;
    }

    public Long getChunkId() {
        return chunkId;
    }

    public String getType() {
        return type;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public String getQuote() {
        return quote;
    }

    public void edit(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }
}
