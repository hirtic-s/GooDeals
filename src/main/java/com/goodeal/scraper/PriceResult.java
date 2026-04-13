package com.goodeal.scraper;

import java.math.BigDecimal;

/**
 * Immutable value object carrying a single price result from a scraper.
 * Implemented as a Java record for zero-boilerplate immutability.
 */
public record PriceResult(
        String productName,
        String brand,
        String storeName,
        BigDecimal price,
        String currency,
        String productUrl,
        String imageUrl
) {

    /**
     * Convenience: returns true if this result carries a valid (non-null, positive) price.
     */
    public boolean hasValidPrice() {
        return price != null && price.compareTo(BigDecimal.ZERO) > 0;
    }

    /** Static factory builder-style method for readable construction. */
    public static PriceResultBuilder builder() {
        return new PriceResultBuilder();
    }

    /** Fluent builder for PriceResult. */
    public static final class PriceResultBuilder {
        private String productName;
        private String brand;
        private String storeName;
        private BigDecimal price;
        private String currency;
        private String productUrl;
        private String imageUrl;

        public PriceResultBuilder productName(String v) { this.productName = v; return this; }
        public PriceResultBuilder brand(String v) { this.brand = v; return this; }
        public PriceResultBuilder storeName(String v) { this.storeName = v; return this; }
        public PriceResultBuilder price(BigDecimal v) { this.price = v; return this; }
        public PriceResultBuilder currency(String v) { this.currency = v; return this; }
        public PriceResultBuilder productUrl(String v) { this.productUrl = v; return this; }
        public PriceResultBuilder imageUrl(String v) { this.imageUrl = v; return this; }

        public PriceResult build() {
            return new PriceResult(productName, brand, storeName, price, currency, productUrl, imageUrl);
        }
    }
}
