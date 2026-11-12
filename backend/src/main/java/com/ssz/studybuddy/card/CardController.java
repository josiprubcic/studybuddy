package com.ssz.studybuddy.card;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CardController {

    private final CardService cards;

    public CardController(CardService cards) {
        this.cards = cards;
    }

    @PostMapping("/documents/{documentId}/cards/generate")
    public List<CardResponse> generate(@PathVariable Long documentId) {
        return cards.generate(documentId);
    }

    @GetMapping("/documents/{documentId}/cards")
    public List<CardResponse> list(@PathVariable Long documentId) {
        return cards.list(documentId);
    }

    @PutMapping("/cards/{cardId}")
    public CardResponse update(@PathVariable Long cardId, @Valid @RequestBody UpdateCardRequest request) {
        return cards.update(cardId, request);
    }

    @DeleteMapping("/cards/{cardId}")
    public ResponseEntity<Void> delete(@PathVariable Long cardId) {
        cards.delete(cardId);
        return ResponseEntity.noContent().build();
    }
}
