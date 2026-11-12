package com.ssz.studybuddy.focus;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/focus-sessions")
public class FocusSessionController {

    private final FocusSessionService sessions;

    public FocusSessionController(FocusSessionService sessions) {
        this.sessions = sessions;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FocusSessionResponse create(@Valid @RequestBody CreateFocusSessionRequest request) {
        return sessions.create(request);
    }

    @GetMapping("/summary")
    public FocusSummaryResponse summary(@RequestParam Instant from, @RequestParam Instant to) {
        return sessions.summary(from, to);
    }
}
