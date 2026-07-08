package com.nexus.seos.api;

import com.nexus.seos.ai.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final GeminiService geminiService;
    private static final List<String> VALID_PERSONAS = List.of("TUTOR", "ARCHITECT", "DEBUGGER", "INTERVIEWER");

    @Autowired
    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String persona = request.get("persona");

        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required and cannot be empty."));
        }

        if (persona == null || persona.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Persona is required and cannot be empty."));
        }

        String upperPersona = persona.toUpperCase();
        if (!VALID_PERSONAS.contains(upperPersona)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid persona: " + persona));
        }

        String responseText = geminiService.generateResponse(upperPersona, prompt);
        return ResponseEntity.ok(Map.of("response", responseText));
    }
}
