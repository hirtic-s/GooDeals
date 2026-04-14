package com.goodeal.service;

import com.goodeal.dto.ChatResponse;
import com.goodeal.dto.SearchResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Orchestrates live price fetching and Gemini 1.5 Flash inference
 * to produce witty, data-backed shopping recommendations.
 *
 * <p><b>Flow:</b>
 * <ol>
 *   <li>Delegates to {@link SearchService} for live Amazon/Flipkart results.</li>
 *   <li>Formats the top-10 results as a text context for the model.</li>
 *   <li>Calls the Gemini 1.5 Flash API (via RestTemplate) with a system prompt
 *       that defines GooBot's personality.</li>
 *   <li>Returns the model's reply wrapped in {@link ChatResponse}.</li>
 * </ol>
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
            + "?key=AIzaSyDHf1CIr15_JRn3TYWyuEEuXyLwWHNu0dU";

    private static final String SYSTEM_PROMPT =
            "You are GooBot — a witty, sharp, and slightly cheeky shopping assistant for GooDeals, "
            + "India's coolest real-time price comparison platform. "
            + "You will receive a user query and live price data from Amazon and Flipkart. "
            + "Give an opinionated, confident recommendation with the product name, best price in ₹, "
            + "and a punchy one-liner verdict. "
            + "Keep it under 4 sentences. No markdown headers or bullet walls. Just conversational genius.";

    private final SearchService searchService;
    private final RestTemplate restTemplate = new RestTemplate();

    public ChatService(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Processes a user chat message by fetching live prices and querying Gemini.
     *
     * @param userMessage the raw user query (e.g. "Best gaming phone under 40k")
     * @return a {@link ChatResponse} containing GooBot's recommendation
     */
    public ChatResponse chat(String userMessage) {
        // Run on a virtual thread so the HTTP calls don't block a platform thread
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var future = executor.submit(() -> {
                String context = fetchPriceContext(userMessage);
                String fullPrompt = "User query: " + userMessage + "\n\nLive price data:\n" + context;
                return callGemini(fullPrompt);
            });
            return new ChatResponse(future.get());
        } catch (Exception e) {
            log.error("Chat processing failed: {}", e.getMessage(), e);
            return new ChatResponse("Oops! GooBot had a brain freeze. Try again in a sec!");
        }
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private String fetchPriceContext(String query) {
        try {
            SearchResponseDto results = searchService.search(query);
            if (results.results().isEmpty()) {
                return "No live price data found for this query.";
            }
            return results.results().stream()
                    .limit(10)
                    .map(r -> String.format("- %s (%s) on %s: ₹%.0f",
                            r.productName(), r.brand(), r.storeName(), r.price()))
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.warn("Price context fetch failed for '{}': {}", query, e.getMessage());
            return "No live price data available right now.";
        }
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String userPrompt) {
        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT))
                ),
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<?> response = restTemplate.postForEntity(GEMINI_URL, entity, Map.class);
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            if (responseBody == null) return fallback();

            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) return fallback();

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String text = (String) parts.get(0).get("text");
            return text != null ? text.trim() : fallback();

        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            return fallback();
        }
    }

    private static String fallback() {
        return "My AI brain is on a coffee break. Try again in a moment!";
    }
}
