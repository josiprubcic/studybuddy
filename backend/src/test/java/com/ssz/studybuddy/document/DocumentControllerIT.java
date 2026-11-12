package com.ssz.studybuddy.document;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Uploads real PDFs through the HTTP endpoint into a real Postgres (Testcontainers). */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class DocumentControllerIT {

    @Autowired
    MockMvc mvc;

    @Test
    void uploadStoresMarkdownAndChunksThatCanBeReadBack() throws Exception {
        MvcResult created = mvc.perform(multipart("/api/documents").file(pdf("C:\\notes\\biology.pdf", textPdf())))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", startsWith("/api/documents/")))
                .andExpect(jsonPath("$.name").value("biology.pdf"))
                .andExpect(jsonPath("$.type").value("pdf"))
                .andExpect(jsonPath("$.chunkCount").value(2))
                .andReturn();

        String location = created.getResponse().getHeader("Location");
        mvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markdown", startsWith("# Mitochondria\n\nMitochondria produce ATP.")))
                .andExpect(jsonPath("$.chunks[0].position").value(0))
                .andExpect(jsonPath("$.chunks[0].heading").value("Mitochondria"))
                .andExpect(jsonPath("$.chunks[0].text").value("Mitochondria produce ATP."))
                .andExpect(jsonPath("$.chunks[1].heading").value("Ribosomes"));

        mvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", hasItem("biology.pdf")));
    }

    @Test
    void rejectsAFileThatIsNotAPdf() throws Exception {
        var notPdf = new MockMultipartFile("file", "notes.pdf", "application/pdf", "hello".getBytes());
        mvc.perform(multipart("/api/documents").file(notPdf))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.code").value("NOT_PDF"))
                .andExpect(jsonPath("$.detail").value("Only PDF files are supported."));
    }

    @Test
    void rejectsAPdfWithoutText() throws Exception {
        mvc.perform(multipart("/api/documents").file(pdf("scan.pdf", emptyPdf())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("NO_TEXT"))
                .andExpect(jsonPath("$.detail", containsString("no text")));
    }

    @Test
    void unknownDocumentIs404ProblemDetail() throws Exception {
        mvc.perform(get("/api/documents/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("DOCUMENT_NOT_FOUND"));
    }

    private static MockMultipartFile pdf(String name, byte[] bytes) {
        return new MockMultipartFile("file", name, "application/pdf", bytes);
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

    private static byte[] emptyPdf() throws IOException {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            doc.addPage(new PDPage());
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
