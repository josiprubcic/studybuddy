package com.ssz.studybuddy.document;

import jakarta.persistence.*;

/**
 * One section of a document. Cards and quizzes point to a chunk and quote its text,
 * so a chunk is never edited after it is saved.
 */
@Entity
@Table(name = "chunks")
public class Chunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private int position;

    @Column(columnDefinition = "text")
    private String heading;

    @Column(nullable = false, columnDefinition = "text")
    private String text;

    protected Chunk() {
    }

    public Chunk(Long documentId, int position, String heading, String text) {
        this.documentId = documentId;
        this.position = position;
        this.heading = heading;
        this.text = text;
    }

    public Long getId() {
        return id;
    }

    public int getPosition() {
        return position;
    }

    public String getHeading() {
        return heading;
    }

    public String getText() {
        return text;
    }
}
