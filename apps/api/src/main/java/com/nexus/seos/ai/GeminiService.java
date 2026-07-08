package com.nexus.seos.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class GeminiService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:#{systemEnvironment['GEMINI_API_KEY']}}")
    private String apiKey;

    public GeminiService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateResponse(String persona, String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "[Mock " + persona + " Mode] Hello! API key is not configured. Here is a simulated response to: \"" + prompt + "\"";
        }

        try {
            String systemInstruction = getSystemInstruction(persona);
            String fullPrompt = systemInstruction + "\n\nUser input:\n" + prompt;

            // Build request JSON
            ObjectNode rootNode = objectMapper.createObjectNode();
            ArrayNode contentsArray = rootNode.putArray("contents");
            ObjectNode contentNode = contentsArray.addObject();
            ArrayNode partsArray = contentNode.putArray("parts");
            ObjectNode partNode = partsArray.addObject();
            partNode.put("text", fullPrompt);

            ObjectNode generationConfig = rootNode.putObject("generationConfig");
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 2048);

            String requestBody = objectMapper.writeValueAsString(rootNode);

            // API Endpoint
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "Gemini API error (Status " + response.statusCode() + "): " + response.body();
            }

            // Parse response
            ObjectNode responseJson = (ObjectNode) objectMapper.readTree(response.body());
            return responseJson.at("/candidates/0/content/parts/0/text").asText("No response text found.");

        } catch (Exception e) {
            return "Failed to contact Gemini service: " + e.getMessage();
        }
    }

    private String getSystemInstruction(String persona) {
        return switch (persona.toUpperCase()) {
            case "TUTOR" -> 
                "You are the SEOS AI Tutor. Your purpose is adaptive tutoring, breaking down complex coding topics, and generating practice quizzes. Be encourageing, detail-oriented, and educational.";
            case "ARCHITECT" -> 
                "You are the SEOS AI Architect. Your purpose is tech-debt analysis, architectural reviews, and defending system design choices. Be rigorous, opinionated, and focused on clean code, design patterns, and scalability.";
            case "DEBUGGER" -> 
                "You are the SEOS AI Debugger. Your purpose is diagnosing errors, inspecting code stack traces, and fixing bugs. Be logical, precise, and provide concise fix suggestions.";
            case "INTERVIEWER" -> 
                "You are the SEOS AI Interviewer. Conduct technical coding and system design mock interviews. Ask follow-up questions, evaluate user solutions, and provide structured feedback.";
            default -> 
                "You are the SEOS AI Orchestrator. Help the software engineering student learn best practices, code correctly, and pass interviews.";
        };
    }
}
