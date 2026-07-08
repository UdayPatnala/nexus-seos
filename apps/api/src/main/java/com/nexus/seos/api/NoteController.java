package com.nexus.seos.api;

import com.nexus.seos.database.Note;
import com.nexus.seos.database.Repositories.NoteRepository;
import com.nexus.seos.database.Repositories.ConceptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteRepository noteRepository;
    private final ConceptRepository conceptRepository;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public NoteController(NoteRepository noteRepository, ConceptRepository conceptRepository, JwtTokenProvider tokenProvider) {
        this.noteRepository = noteRepository;
        this.conceptRepository = conceptRepository;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping
    public ResponseEntity<?> getNotes(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(noteRepository.findByUserId(userId));
    }

    @GetMapping("/concept/{conceptId}")
    public ResponseEntity<?> getNoteByConcept(
            @PathVariable UUID conceptId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);
        
        Optional<Note> noteOpt = noteRepository.findByUserIdAndConceptId(userId, conceptId);
        if (noteOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("markdown", ""));
        }
        return ResponseEntity.ok(noteOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> saveNote(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);

        String conceptIdStr = request.get("conceptId");
        String markdown = request.get("markdown");


        // conceptId is optional — allow general (concept-free) notes
        UUID conceptId = (conceptIdStr != null && !conceptIdStr.isBlank() && !conceptIdStr.equals("null"))
                ? UUID.fromString(conceptIdStr) : null;

        if (conceptId != null && !conceptRepository.existsById(conceptId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Concept not found."));
        }

        Optional<Note> noteOpt = conceptId != null
                ? noteRepository.findByUserIdAndConceptId(userId, conceptId)
                : Optional.empty();

        Note note;
        if (noteOpt.isPresent()) {
            note = noteOpt.get();
            note.setMarkdown(markdown);
        } else {
            note = new Note();
            note.setUserId(userId);
            note.setConceptId(conceptId);
            note.setMarkdown(markdown);
        }

        noteRepository.save(note);
        return ResponseEntity.ok(note);
    }
}
