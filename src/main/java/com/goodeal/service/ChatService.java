package com.goodeal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goodeal.dto.ChatAction;
import com.goodeal.dto.ChatResponse;
import com.goodeal.dto.PriceResultDto;
import com.goodeal.dto.SearchResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;

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

    private static final String GEMINI_BASE_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Value("${goodeal.gemini.api-key}")
    private String geminiApiKey;

    private static final String SYSTEM_PROMPT =
            "You are GooBot — a witty, sharp, and slightly cheeky shopping assistant for GooDeals, "
            + "India's coolest real-time price comparison platform. "
            + "You will receive a user query and live price data from Amazon and Flipkart (each entry is numbered and "
            + "includes the product URL and image URL).\n\n"
            + "ALWAYS respond with a raw JSON object — no markdown fences, no extra text outside the JSON:\n"
            + "{\n"
            + "  \"reply\": \"One witty sentence confirming the search; you may tease the top picks briefly.\",\n"
            + "  \"action\": {\n"
            + "    \"type\": \"SEARCH\",\n"
            + "    \"query\": \"product search term without storage/RAM qualifiers\",\n"
            + "    \"filters\": {\n"
            + "      \"priceRange\": [0, 80000],\n"
            + "      \"brands\": [],\n"
            + "      \"rams\": [],\n"
            + "      \"storages\": []\n"
            + "    }\n"
            + "  },\n"
            + "  \"items\": [\n"
            + "    {\n"
            + "      \"productName\": \"exact product name from the live data\",\n"
            + "      \"storeName\": \"Amazon or Flipkart\",\n"
            + "      \"price\": 65000,\n"
            + "      \"productUrl\": \"exact url from the live data\",\n"
            + "      \"imageUrl\": \"exact img url from the live data\"\n"
            + "    }\n"
            + "  ]\n"
            + "}\n\n"
            + "Rules:\n"
            + "- Set \"action\" to null and \"items\" to [] when the user is NOT asking to find or buy a product.\n"
            + "- When the user IS searching for a product, populate \"action\" AND \"items\":\n"
            + "  - \"action.query\": the core product name ONLY — strip out storage (128GB, 256GB, 1TB…) and RAM (8GB, 16GB…); those go in filters\n"
            + "  - \"action.filters.priceRange\": [minPrice, maxPrice] in ₹; use [0, 10000000] if no budget is mentioned\n"
            + "  - \"action.filters.brands\": brand names if the user specified any, otherwise []\n"
            + "  - \"action.filters.rams\": RAM values the user mentioned (e.g. [\"8GB\", \"16GB\"]), normalized uppercase; [] if none\n"
            + "  - \"action.filters.storages\": storage values the user mentioned (e.g. [\"128GB\", \"1TB\"]), normalized uppercase; [] if none\n"
            + "  - \"items\": pick the TOP 3 to 5 best-value deals from the live data. Copy the productUrl and imageUrl "
            + "EXACTLY as they appear in the live data — do not fabricate or alter URLs.\n"
            + "- The \"reply\" must be ONE short witty sentence. Do NOT list products in the reply text; the cards handle that.\n"
            + "- If live data has fewer than 3 entries, include all of them in \"items\".";

    private final SearchService searchService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

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
                String context = fetchPriceContext(stripSpecTokens(userMessage));

                // No results means the scraper found nothing — skip Gemini entirely
                // to conserve API quota and give the user actionable advice instead.
                if (context == null) {
                    return new ChatResponse(
                            "I found the products, but my filters were a bit too picky. "
                            + "Try searching for just the model name — something like "
                            + "\"iPhone 15 128GB\" — without the extra words!");
                }

                String fullPrompt = "User query: " + userMessage + "\n\nLive price data:\n" + context;
                String rawText = callGemini(fullPrompt);
                return parseGeminiText(rawText);
            });
            return future.get();
        } catch (Exception e) {
            log.error("Chat processing failed: {}", e.getMessage(), e);
            return new ChatResponse("Oops! GooBot had a brain freeze. Try again in a sec!");
        }
    }

    /**
     * Parses the raw text from Gemini into a {@link ChatResponse}.
     * Gemini is instructed to return JSON; this method handles the happy path
     * and falls back gracefully if the model returns plain text instead.
     */
    private ChatResponse parseGeminiText(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return new ChatResponse(fallback());
        }
        try {
            // Strip optional ```json ... ``` fences that the model sometimes adds
            String cleaned = rawText.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned
                        .replaceAll("(?s)^```(?:json)?\\s*", "")
                        .replaceAll("\\s*```$", "")
                        .trim();
            }

            JsonNode root = objectMapper.readTree(cleaned);
            String reply = root.path("reply").asText(fallback());

            JsonNode actionNode = root.path("action");
            ChatAction action = null;
            if (actionNode.isObject()) {
                action = objectMapper.treeToValue(actionNode, ChatAction.class);
                // Discard action if essential fields are missing
                if (action.query() == null || action.query().isBlank()) {
                    action = null;
                }
            }

            List<PriceResultDto> items = null;
            JsonNode itemsNode = root.path("items");
            if (itemsNode.isArray() && !itemsNode.isEmpty()) {
                items = new ArrayList<>();
                for (JsonNode item : itemsNode) {
                    BigDecimal price = item.path("price").isMissingNode() || item.path("price").isNull()
                            ? null : item.path("price").decimalValue();
                    String productUrl = item.path("productUrl").asText(null);
                    String imageUrl   = item.path("imageUrl").asText(null);
                    // Skip items whose URLs were hallucinated (empty string = not provided)
                    if (productUrl != null && productUrl.isBlank()) productUrl = null;
                    if (imageUrl   != null && imageUrl.isBlank())   imageUrl   = null;
                    items.add(PriceResultDto.builder()
                            .productName(item.path("productName").asText(null))
                            .storeName(item.path("storeName").asText(null))
                            .price(price)
                            .productUrl(productUrl)
                            .imageUrl(imageUrl)
                            .build());
                }
            }

            return new ChatResponse(reply, action, items);

        } catch (Exception e) {
            log.warn("Could not parse Gemini response as JSON, using raw text. Error: {}", e.getMessage());
            return new ChatResponse(rawText.trim());
        }
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Strips storage (e.g. "128GB", "1TB") and RAM (e.g. "8GB") tokens from a
     * raw user message so the scraper receives a clean product-name query.
     * Budget phrases like "under 40k" or "below ₹80000" are also removed.
     */
    private static String stripSpecTokens(String message) {
        return message
                // storage / RAM: digits followed by GB or TB (e.g. "128GB", "1 TB", "16gb")
                .replaceAll("(?i)\\b\\d+\\s*(?:GB|TB)\\b", "")
                // budget phrases: "under 40k", "below ₹80000", "within 50,000"
                .replaceAll("(?i)\\b(?:under|below|within|upto|up to)\\s*[₹]?[\\d,]+[k]?\\b", "")
                // filler words that pollute scraper queries
                .replaceAll("(?i)\\b(best|top|good|cheap|latest|with|storage|ram|memory|buy|me|a|an|the|for|some)\\b", "")
                // collapse extra whitespace
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    /**
     * Fetches live price data and formats it as a context string for Gemini.
     *
     * @return formatted price context, or {@code null} if the search returned no results
     *         (signals the caller to skip the Gemini call entirely)
     */
    private String fetchPriceContext(String query) {
        try {
            SearchResponseDto results = searchService.search(query);
            if (results.results().isEmpty()) {
                log.info("No scraper results for '{}' — skipping Gemini call", query);
                return null;
            }
            var list = results.results().stream().limit(4).toList();
            var sb = new StringBuilder();
            for (int i = 0; i < list.size(); i++) {
                var r = list.get(i);
                sb.append(String.format("[%d] %s (%s) on %s: ₹%.0f | url: %s | img: %s\n",
                        i + 1,
                        r.productName(), r.brand(), r.storeName(), r.price(),
                        r.productUrl() != null ? r.productUrl() : "",
                        r.imageUrl() != null ? r.imageUrl() : ""));
            }
            return sb.toString().trim();
        } catch (Exception e) {
            log.warn("Price context fetch failed for '{}': {}", query, e.getMessage());
            return "No live price data available right now.";
        }
    }

    /**
     * LRU response cache — keyed on the normalized user message.
     *
     * The free-tier quota is only 20 requests/day, so avoiding duplicate Gemini
     * calls for the same question is far more effective than retrying on 429s
     * (retries just burn more of the tiny daily allowance).
     * Capacity of 50 covers a full day of varied queries with room to spare.
     */
    private final Map<String, String> geminiCache = Collections.synchronizedMap(
            new LinkedHashMap<>(64, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
                    return size() > 50;
                }
            }
    );

    @SuppressWarnings("unchecked")
    private String callGemini(String userPrompt) {
        // Normalize the prompt to maximize cache hits across minor phrasing differences
        String cacheKey = userPrompt.toLowerCase().trim().replaceAll("\\s+", " ");
        String cached = geminiCache.get(cacheKey);
        if (cached != null) {
            log.info("Gemini cache hit — serving stored response (quota saved)");
            return cached;
        }

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
            ResponseEntity<?> response = restTemplate.postForEntity(
                    GEMINI_BASE_URL + geminiApiKey, entity, Map.class);
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            if (responseBody == null) return fallback();

            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) return fallback();

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String text = (String) parts.get(0).get("text");
            if (text == null) return fallback();

            String result = text.trim();
            geminiCache.put(cacheKey, result);
            return result;

        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("Gemini 429 — daily/per-minute quota exhausted, no retries (would burn more quota)");
            return "{\"reply\":\"GooBot's AI quota is maxed out for now — only 20 chats per day on the free tier. "
                    + "The live results grid below still has fresh prices! "
                    + "Quota resets at midnight Pacific time.\",\"action\":null}";
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            return fallback();
        }
    }

    private static String fallback() {
        return "My AI brain is on a coffee break. Try again in a moment!";
    }
}
