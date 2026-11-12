package com.ssz.studybuddy.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {

    @Query("""
            select new com.ssz.studybuddy.card.CardResponse(
                c.id, ch.id, ch.position, ch.heading, c.type, c.question, c.answer, c.quote)
            from Card c, Chunk ch
            where ch.id = c.chunkId and ch.documentId = :documentId and c.userId = :userId
            order by ch.position, c.id""")
    List<CardResponse> findByDocument(Long documentId, Long userId);

    /** Every card of the user, materials newest first, sections in order. */
    @Query("""
            select new com.ssz.studybuddy.card.CardResponse(
                c.id, ch.id, ch.position, ch.heading, c.type, c.question, c.answer, c.quote)
            from Card c, Chunk ch, Document d
            where ch.id = c.chunkId and d.id = ch.documentId and c.userId = :userId
            order by d.createdAt desc, d.id desc, ch.position, c.id""")
    List<CardResponse> findAllForUser(Long userId);

    Optional<Card> findByIdAndUserId(Long id, Long userId);
}
