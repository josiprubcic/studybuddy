package com.ssz.studybuddy.document;

import com.ssz.studybuddy.user.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Service
public class DocumentService {

    private static final byte[] PDF_MAGIC = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    private final PdfToMarkdownConverter converter;
    private final MarkdownChunker chunker;
    private final DocumentRepository documents;
    private final ChunkRepository chunks;
    private final CurrentUserService currentUser;
    private final TransactionTemplate transaction;

    public DocumentService(PdfToMarkdownConverter converter, MarkdownChunker chunker, DocumentRepository documents,
                           ChunkRepository chunks, CurrentUserService currentUser, TransactionTemplate transaction) {
        this.converter = converter;
        this.chunker = chunker;
        this.documents = documents;
        this.chunks = chunks;
        this.currentUser = currentUser;
        this.transaction = transaction;
    }

    /** Converts the PDF outside the transaction, then saves the document and its chunks together. */
    public DocumentSummary upload(MultipartFile file) {
        byte[] bytes = readPdf(file);
        String markdown = toMarkdown(bytes);
        List<MarkdownChunker.Section> sections = chunker.split(markdown);
        String name = displayName(file.getOriginalFilename());
        Long userId = currentUser.currentUserId();

        return transaction.execute(status -> {
            Document document = documents.save(new Document(userId, name, "pdf", markdown));
            for (int i = 0; i < sections.size(); i++) {
                MarkdownChunker.Section s = sections.get(i);
                chunks.save(new Chunk(document.getId(), i, s.heading(), s.text()));
            }
            return new DocumentSummary(document.getId(), document.getName(), document.getType(),
                    document.getCreatedAt(), sections.size());
        });
    }

    @Transactional(readOnly = true)
    public List<DocumentSummary> list() {
        return documents.findSummariesByUserId(currentUser.currentUserId());
    }

    @Transactional(readOnly = true)
    public DocumentDetail get(Long id) {
        Document d = documents.findByIdAndUserId(id, currentUser.currentUserId())
                .orElseThrow(() -> new DocumentNotFoundException(id));
        List<DocumentDetail.ChunkResponse> sections = chunks.findByDocumentIdOrderByPosition(d.getId()).stream()
                .map(c -> new DocumentDetail.ChunkResponse(c.getId(), c.getPosition(), c.getHeading(), c.getText()))
                .toList();
        return new DocumentDetail(d.getId(), d.getName(), d.getType(), d.getCreatedAt(), d.getMarkdown(), sections);
    }

    // The file's own bytes decide, not the client-sent Content-Type or file name.
    private static byte[] readPdf(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidDocumentException("The file is empty.");
        }
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length < PDF_MAGIC.length
                    || !Arrays.equals(Arrays.copyOf(bytes, PDF_MAGIC.length), PDF_MAGIC)) {
                throw new InvalidDocumentException("Only PDF files are supported.");
            }
            return bytes;
        } catch (IOException e) {
            throw new InvalidDocumentException("The file could not be read.");
        }
    }

    private String toMarkdown(byte[] pdf) {
        String markdown;
        try {
            markdown = converter.convert(pdf);
        } catch (IOException e) {
            throw new InvalidDocumentException("The PDF is damaged or password-protected.");
        }
        if (markdown.isBlank()) {
            throw new InvalidDocumentException("The PDF has no text. Scanned documents are not supported yet.");
        }
        return markdown;
    }

    // Keep only the file name: some browsers send a full path.
    private static String displayName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "document.pdf";
        }
        String name = originalFilename.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1).strip();
        return name.isEmpty() ? "document.pdf" : name;
    }
}
