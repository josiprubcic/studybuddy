package com.ssz.studybuddy.focus;

import com.ssz.studybuddy.user.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
public class FocusSessionService {

    private static final Duration CLOCK_SKEW = Duration.ofMinutes(5);
    private static final Duration MAX_RANGE = Duration.ofDays(31);

    private final FocusSessionRepository sessions;
    private final CurrentUserService currentUser;

    public FocusSessionService(FocusSessionRepository sessions, CurrentUserService currentUser) {
        this.sessions = sessions;
        this.currentUser = currentUser;
    }

    @Transactional
    public FocusSessionResponse create(CreateFocusSessionRequest request) {
        if (request.startedAt().isAfter(Instant.now().plus(CLOCK_SKEW))) {
            throw new InvalidFocusSessionException("startedAt is in the future");
        }
        FocusSession s = sessions.save(new FocusSession(currentUser.currentUserId(), request.type(),
                request.startedAt(), request.durationSeconds(), request.completed()));
        return new FocusSessionResponse(s.getId(), s.getType(), s.getStartedAt(), s.getDurationSeconds(), s.isCompleted());
    }

    @Transactional(readOnly = true)
    public FocusSummaryResponse summary(Instant from, Instant to) {
        if (!from.isBefore(to) || Duration.between(from, to).compareTo(MAX_RANGE) > 0) {
            throw new InvalidFocusSessionException("from must be before to, at most 31 days apart");
        }
        return sessions.summarize(currentUser.currentUserId(), from, to);
    }
}
