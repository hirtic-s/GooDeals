package com.goodeal.scraper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.Random;

/**
 * Shared utility base class for scraper implementations.
 * Provides common helpers: User-Agent rotation and price parsing.
 */
public abstract class AbstractScraper implements Scraper {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    private static final String[] USER_AGENTS = {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
    };

    private static final Random RANDOM = new Random();

    /**
     * Returns a randomly selected User-Agent string from the pool.
     */
    protected String randomUserAgent() {
        return USER_AGENTS[RANDOM.nextInt(USER_AGENTS.length)];
    }

    /**
     * Strips currency symbols (₹, $, €, £), commas, and whitespace from a price string
     * and converts it to a {@link BigDecimal}.
     *
     * @param raw the raw price string e.g. "₹1,29,900" or "$1,299.00"
     * @return parsed {@link BigDecimal} or {@code null} if parsing fails
     */
    protected BigDecimal parsePrice(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            String cleaned = raw
                    .replaceAll("[₹$€£¥]", "")
                    .replaceAll(",", "")
                    .replaceAll("\\s+", "")
                    .replaceAll("[^\\d.]", "")
                    .trim();

            if (cleaned.isEmpty()) {
                return null;
            }
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            log.warn("[{}] Failed to parse price: '{}' — {}", getStoreName(), raw, e.getMessage());
            return null;
        }
    }

    /**
     * Detects the currency symbol from the raw price string.
     *
     * @param raw the raw price string
     * @return ISO currency code or "INR" as default
     */
    protected String detectCurrency(String raw) {
        if (raw == null) return "INR";
        if (raw.contains("$")) return "USD";
        if (raw.contains("€")) return "EUR";
        if (raw.contains("£")) return "GBP";
        if (raw.contains("¥")) return "JPY";
        return "INR";
    }
}
