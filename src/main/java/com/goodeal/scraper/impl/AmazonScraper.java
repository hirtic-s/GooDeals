package com.goodeal.scraper.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goodeal.scraper.AbstractScraper;
import com.goodeal.scraper.PriceResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Amazon India scraper — delegates to the Python Scrapling microservice.
 */
@Service
public class AmazonScraper extends AbstractScraper {

    private static final String STORE_NAME = "Amazon";

    @Value("${goodeal.scraper.service-url:http://localhost:8000}")
    private String scraperServiceUrl;

    @Value("${goodeal.scraper.max-results:25}")
    private int maxResults;

    @Value("${goodeal.scraper.timeout-ms:30000}")
    private int timeoutMs;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String getStoreName() {
        return STORE_NAME;
    }

    @Override
    public List<PriceResult> scrape(String query) {
        List<PriceResult> results = new ArrayList<>();
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format(
                    "%s/scrape?store=amazon&query=%s&max_results=%d",
                    scraperServiceUrl, encodedQuery, maxResults
            );

            log.info("[{}] Calling scraper service: {}", STORE_NAME, url);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .timeout(Duration.ofMillis(timeoutMs))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("[{}] Scraper service returned HTTP {}", STORE_NAME, response.statusCode());
                return results;
            }

            results = parseResponse(response.body());
            log.info("[{}] {} results received", STORE_NAME, results.size());

        } catch (Exception e) {
            log.error("[{}] Failed to call scraper service: {}", STORE_NAME, e.getMessage());
        }
        return results;
    }

    private List<PriceResult> parseResponse(String body) throws Exception {
        List<PriceResult> results = new ArrayList<>();
        JsonNode root = mapper.readTree(body);
        JsonNode items = root.path("results");
        if (!items.isArray()) return results;

        for (JsonNode node : items) {
            try {
                String priceText = node.path("price").asText(null);
                BigDecimal price = priceText != null && !priceText.isBlank()
                        ? new BigDecimal(priceText)
                        : null;

                PriceResult result = PriceResult.builder()
                        .productName(node.path("productName").asText())
                        .brand(node.path("brand").asText())
                        .storeName(STORE_NAME)
                        .price(price)
                        .currency(node.path("currency").asText("INR"))
                        .productUrl(node.path("productUrl").asText())
                        .imageUrl(node.path("imageUrl").asText())
                        .build();

                if (result.hasValidPrice()) {
                    results.add(result);
                }
            } catch (Exception e) {
                log.warn("[{}] Skipping malformed result node: {}", STORE_NAME, e.getMessage());
            }
        }
        return results;
    }
}
