package com.ssz.studybuddy.focus;

import com.ssz.studybuddy.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class FocusSessionControllerIT {

    @Autowired
    MockMvc mvc;

    private ResultActions record(String type, String startedAt, int seconds, boolean completed) throws Exception {
        return mvc.perform(post("/api/focus-sessions").contentType(MediaType.APPLICATION_JSON).content(
                "{\"type\":\"%s\",\"startedAt\":\"%s\",\"durationSeconds\":%d,\"completed\":%b}"
                        .formatted(type, startedAt, seconds, completed)));
    }

    private ResultActions summary(String from, String to) throws Exception {
        return mvc.perform(get("/api/focus-sessions/summary").param("from", from).param("to", to));
    }

    @Test
    void recordsSessionsAndSummarizesCompletedFocusOnly() throws Exception {
        record("focus", "2021-03-01T10:00:00Z", 1500, true).andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.type").value("focus"))
                .andExpect(jsonPath("$.startedAt").value("2021-03-01T10:00:00Z"))
                .andExpect(jsonPath("$.durationSeconds").value(1500))
                .andExpect(jsonPath("$.completed").value(true));
        record("break", "2021-03-01T10:25:00Z", 300, true).andExpect(status().isCreated());
        record("focus", "2021-03-01T10:30:00Z", 600, false).andExpect(status().isCreated());

        summary("2021-03-01T00:00:00Z", "2021-03-02T00:00:00Z").andExpect(status().isOk())
                .andExpect(jsonPath("$.completedFocusBlocks").value(1))
                .andExpect(jsonPath("$.focusSeconds").value(1500));
        summary("2021-03-02T00:00:00Z", "2021-03-03T00:00:00Z").andExpect(status().isOk())
                .andExpect(jsonPath("$.completedFocusBlocks").value(0))
                .andExpect(jsonPath("$.focusSeconds").value(0));
    }

    @Test
    void invalidBodyIs400() throws Exception {
        record("focus", "2021-03-01T10:00:00Z", 0, true)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        record("nap", "2021-03-01T10:00:00Z", 60, true)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        record("focus", Instant.now().plusSeconds(86400).toString(), 60, true)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void invalidRangeIs400() throws Exception {
        summary("2021-03-02T00:00:00Z", "2021-03-02T00:00:00Z")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        summary("2021-01-01T00:00:00Z", "2021-03-01T00:00:00Z")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        mvc.perform(get("/api/focus-sessions/summary")).andExpect(status().isBadRequest());
        summary("nope", "2021-03-01T00:00:00Z").andExpect(status().isBadRequest());
    }
}
