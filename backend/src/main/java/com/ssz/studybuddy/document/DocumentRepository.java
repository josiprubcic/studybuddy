package com.ssz.studybuddy.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("""
            select new com.ssz.studybuddy.document.DocumentSummary(
                d.id, d.name, d.type, d.createdAt,
                (select count(c) from Chunk c where c.documentId = d.id))
            from Document d
            where d.userId = :userId
            order by d.createdAt desc, d.id desc""")
    List<DocumentSummary> findSummariesByUserId(Long userId);

    Optional<Document> findByIdAndUserId(Long id, Long userId);
}
