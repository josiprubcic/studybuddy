package com.ssz.studybuddy.document;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documents;

    public DocumentController(DocumentService documents) {
        this.documents = documents;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentSummary> upload(@RequestParam("file") MultipartFile file) {
        DocumentSummary created = documents.upload(file);
        return ResponseEntity.created(URI.create("/api/documents/" + created.id())).body(created);
    }

    @GetMapping
    public List<DocumentSummary> list() {
        return documents.list();
    }

    @GetMapping("/{id}")
    public DocumentDetail get(@PathVariable Long id) {
        return documents.get(id);
    }
}
