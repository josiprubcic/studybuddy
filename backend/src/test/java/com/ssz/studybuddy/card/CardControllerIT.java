package com.ssz.studybuddy.card;

import com.ssz.studybuddy.TestcontainersConfiguration;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class CardControllerIT {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    CardGenerator generator;

    private long uploadDocument() throws Exception {
        String body = mvc.perform(multipart("/api/documents")
                        .file(new MockMultipartFile("file", "bio.pdf", "application/pdf", textPdf())))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return Long.parseLong(body.replaceAll(".*\"id\":(\\d+).*", "$1"));
    }

    private void fakeGenerator() {
        when(generator.generate(eq("Mitochondria"), any())).thenReturn(List.of(
                new GeneratedCard("flashcard", "What do mitochondria produce?", "ATP", "Mitochondria produce ATP."),
                new GeneratedCard("fill_in", "Mitochondria produce ____.", "ATP", "Mitochondria produce ATP."),
                new GeneratedCard("flashcard", "Invented?", "x", "This sentence is not in the text.")));
        when(generator.generate(eq("Ribosomes"), any())).thenReturn(List.of(
                new GeneratedCard("fill_in", "Ribosomes make ____ from amino acids.", "proteins",
                        "Ribosomes make proteins from amino acids.")));
    }

    @Test
    void generateListEditDelete() throws Exception {
        long doc = uploadDocument();
        fakeGenerator();

        mvc.perform(post("/api/documents/{id}/cards/generate", doc))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].chunkPosition").value(0))
                .andExpect(jsonPath("$[0].chunkHeading").value("Mitochondria"))
                .andExpect(jsonPath("$[0].type").value("flashcard"))
                .andExpect(jsonPath("$[1].type").value("fill_in"))
                .andExpect(jsonPath("$[2].chunkPosition").value(1))
                .andExpect(jsonPath("$[2].quote").value("Ribosomes make proteins from amino acids."));

        mvc.perform(post("/api/documents/{id}/cards/generate", doc))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(3)));

        String list = mvc.perform(get("/api/documents/{id}/cards", doc))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(3)))
                .andReturn().getResponse().getContentAsString();
        long cardId = Long.parseLong(list.replaceAll("^\\[\\{\"id\":(\\d+).*", "$1"));

        mvc.perform(put("/api/cards/{id}", cardId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"New Q?\",\"answer\":\"New A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("New Q?"))
                .andExpect(jsonPath("$.answer").value("New A"))
                .andExpect(jsonPath("$.quote").value("Mitochondria produce ATP."));

        mvc.perform(put("/api/cards/{id}", cardId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"Q?\",\"answer\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        mvc.perform(delete("/api/cards/{id}", cardId)).andExpect(status().isNoContent());
        mvc.perform(put("/api/cards/{id}", cardId).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"Q?\",\"answer\":\"A\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("CARD_NOT_FOUND"));
    }

    @Test
    void unknownDocumentIs404() throws Exception {
        mvc.perform(post("/api/documents/999999/cards/generate"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("DOCUMENT_NOT_FOUND"));
    }

    @Test
    void generatorFailureIs503AndEarlierChunksStaySaved() throws Exception {
        long doc = uploadDocument();
        when(generator.generate(eq("Mitochondria"), any())).thenReturn(List.of(
                new GeneratedCard("flashcard", "What do mitochondria produce?", "ATP", "Mitochondria produce ATP.")));
        when(generator.generate(eq("Ribosomes"), any())).thenThrow(new IllegalStateException("401"));

        mvc.perform(post("/api/documents/{id}/cards/generate", doc))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("AI_UNAVAILABLE"));
        mvc.perform(get("/api/documents/{id}/cards", doc)).andExpect(jsonPath("$", hasSize(1)));
    }

    private static byte[] textPdf() throws IOException {
        var regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                write(cs, bold, 16, "Mitochondria", 720);
                write(cs, regular, 11, "Mitochondria produce ATP.", 690);
                write(cs, bold, 16, "Ribosomes", 650);
                write(cs, regular, 11, "Ribosomes make proteins from amino acids.", 620);
            }
            doc.save(out);
            return out.toByteArray();
        }
    }

    private static void write(PDPageContentStream cs, PDType1Font font, float size, String text, float y)
            throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(72, y);
        cs.showText(text);
        cs.endText();
    }
}
