package com.ssz.studybuddy.card;

import com.ssz.studybuddy.document.Chunk;
import com.ssz.studybuddy.document.ChunkRepository;
import com.ssz.studybuddy.document.DocumentNotFoundException;
import com.ssz.studybuddy.document.DocumentRepository;
import com.ssz.studybuddy.user.CurrentUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CardService {

    private static final Logger log = LoggerFactory.getLogger(CardService.class);

    private final CardGenerator generator;
    private final CardRepository cards;
    private final ChunkRepository chunks;
    private final DocumentRepository documents;
    private final CurrentUserService currentUser;
    private final TransactionTemplate transaction;

    public CardService(CardGenerator generator, CardRepository cards, ChunkRepository chunks,
                       DocumentRepository documents, CurrentUserService currentUser, TransactionTemplate transaction) {
        this.generator = generator;
        this.cards = cards;
        this.chunks = chunks;
        this.documents = documents;
        this.currentUser = currentUser;
        this.transaction = transaction;
    }

    /** Calls the AI outside any transaction; each chunk's cards are saved in their own short one. */
    public List<CardResponse> generate(Long documentId) {
        Long userId = currentUser.currentUserId();
        documents.findByIdAndUserId(documentId, userId).orElseThrow(() -> new DocumentNotFoundException(documentId));
        Set<Long> done = cards.findByDocument(documentId, userId).stream()
                .map(CardResponse::chunkId).collect(Collectors.toSet());
        for (Chunk chunk : chunks.findByDocumentIdOrderByPosition(documentId)) {
            if (done.contains(chunk.getId())) {
                continue;
            }
            List<GeneratedCard> valid;
            try {
                valid = CardValidator.validate(generator.generate(chunk.getHeading(), chunk.getText()), chunk.getText());
            } catch (RuntimeException e) {
                log.warn("Card generation failed for chunk {}", chunk.getId(), e);
                throw new AiUnavailableException(e);
            }
            transaction.executeWithoutResult(status -> cards.saveAll(valid.stream()
                    .map(g -> new Card(chunk.getId(), userId, g.type(), g.question(), g.answer(), g.quote()))
                    .toList()));
        }
        return cards.findByDocument(documentId, userId);
    }

    @Transactional(readOnly = true)
    public List<CardResponse> list(Long documentId) {
        Long userId = currentUser.currentUserId();
        documents.findByIdAndUserId(documentId, userId).orElseThrow(() -> new DocumentNotFoundException(documentId));
        return cards.findByDocument(documentId, userId);
    }

    @Transactional
    public CardResponse update(Long cardId, UpdateCardRequest request) {
        Card card = cards.findByIdAndUserId(cardId, currentUser.currentUserId())
                .orElseThrow(() -> new CardNotFoundException(cardId));
        card.edit(request.question().strip(), request.answer().strip());
        Chunk chunk = chunks.findById(card.getChunkId()).orElseThrow();
        return new CardResponse(card.getId(), chunk.getId(), chunk.getPosition(), chunk.getHeading(), card.getType(),
                card.getQuestion(), card.getAnswer(), card.getQuote());
    }

    @Transactional
    public void delete(Long cardId) {
        cards.delete(cards.findByIdAndUserId(cardId, currentUser.currentUserId())
                .orElseThrow(() -> new CardNotFoundException(cardId)));
    }
}
