package com.ssz.studybuddy.focus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;

public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {

    @Query("""
            select new com.ssz.studybuddy.focus.FocusSummaryResponse(count(f), coalesce(sum(f.durationSeconds), 0L))
            from FocusSession f
            where f.userId = :userId and f.type = 'focus' and f.completed = true
              and f.startedAt >= :from and f.startedAt < :to""")
    FocusSummaryResponse summarize(Long userId, Instant from, Instant to);
}
