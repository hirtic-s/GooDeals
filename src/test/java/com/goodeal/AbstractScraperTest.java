package com.goodeal;

import com.goodeal.scraper.AbstractScraper;
import com.goodeal.scraper.PriceResult;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AbstractScraper price parsing and currency detection utilities.
 * No Spring context is required — pure unit tests.
 */
class AbstractScraperTest extends AbstractScraper {

    // Minimal implementations required by the abstract class
    @Override
    public List<PriceResult> scrape(String query) { return List.of(); }
    @Override
    public String getStoreName() { return "TestStore"; }

    // ---------------------------------------------------------------------------
    // parsePrice tests
    // ---------------------------------------------------------------------------

    @Test
    void parsePrice_rupeeWithCommas() {
        BigDecimal result = parsePrice("₹1,29,900");
        assertNotNull(result);
        assertEquals(new BigDecimal("129900"), result);
    }

    @Test
    void parsePrice_dollarWithDecimals() {
        BigDecimal result = parsePrice("$1,299.99");
        assertNotNull(result);
        assertEquals(new BigDecimal("1299.99"), result);
    }

    @Test
    void parsePrice_plainNumber() {
        BigDecimal result = parsePrice("49999");
        assertNotNull(result);
        assertEquals(new BigDecimal("49999"), result);
    }

    @Test
    void parsePrice_nullReturnsNull() {
        assertNull(parsePrice(null));
    }

    @Test
    void parsePrice_blankReturnsNull() {
        assertNull(parsePrice("   "));
    }

    @Test
    void parsePrice_nonNumericReturnsNull() {
        assertNull(parsePrice("Price not available"));
    }

    // ---------------------------------------------------------------------------
    // detectCurrency tests
    // ---------------------------------------------------------------------------

    @Test
    void detectCurrency_dollar() {
        assertEquals("USD", detectCurrency("$1,299"));
    }

    @Test
    void detectCurrency_euro() {
        assertEquals("EUR", detectCurrency("€999"));
    }

    @Test
    void detectCurrency_poundSterling() {
        assertEquals("GBP", detectCurrency("£899"));
    }

    @Test
    void detectCurrency_defaultIsINR() {
        assertEquals("INR", detectCurrency("₹12345"));
        assertEquals("INR", detectCurrency(null));
        assertEquals("INR", detectCurrency("12345"));
    }

    // ---------------------------------------------------------------------------
    // PriceResult.hasValidPrice tests
    // ---------------------------------------------------------------------------

    @Test
    void priceResult_hasValidPrice_positivePrice() {
        PriceResult r = PriceResult.builder()
                .price(new BigDecimal("999"))
                .storeName("Test").productName("Test").currency("INR")
                .productUrl("").build();
        assertTrue(r.hasValidPrice());
    }

    @Test
    void priceResult_hasValidPrice_nullPrice() {
        PriceResult r = PriceResult.builder()
                .price(null)
                .storeName("Test").productName("Test").currency("INR")
                .productUrl("").build();
        assertFalse(r.hasValidPrice());
    }

    @Test
    void priceResult_hasValidPrice_zeroPriceIsInvalid() {
        PriceResult r = PriceResult.builder()
                .price(BigDecimal.ZERO)
                .storeName("Test").productName("Test").currency("INR")
                .productUrl("").build();
        assertFalse(r.hasValidPrice());
    }

    // ---------------------------------------------------------------------------
    // PriceResult record accessor tests
    // ---------------------------------------------------------------------------

    @Test
    void priceResult_accessors_workCorrectly() {
        PriceResult r = PriceResult.builder()
                .productName("iPhone 15")
                .brand("Apple")
                .storeName("Amazon")
                .price(new BigDecimal("79999"))
                .currency("INR")
                .productUrl("https://amazon.in/test")
                .imageUrl("https://amazon.in/img.jpg")
                .build();

        assertEquals("iPhone 15", r.productName());
        assertEquals("Apple", r.brand());
        assertEquals("Amazon", r.storeName());
        assertEquals(new BigDecimal("79999"), r.price());
        assertEquals("INR", r.currency());
        assertEquals("https://amazon.in/test", r.productUrl());
        assertEquals("https://amazon.in/img.jpg", r.imageUrl());
    }
}
