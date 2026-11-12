package com.ssz.studybuddy.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChunkRepository extends JpaRepository<Chunk, Long> {

    List<Chunk> findByDocumentIdOrderByPosition(Long documentId);
}
