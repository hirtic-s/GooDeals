package com.goodeal.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO representing a single price result returned to API consumers.
 * Deliberately omits internal entity IDs and JPA relationships.
 */
public record PriceResultDto(
        String productName,
        String brand,
        String storeName,
        BigDecimal price,
        String currency,
        String productUrl,
        String imageUrl,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime fetchedAt
) {

    public static PriceResultDtoBuilder builder() { return new PriceResultDtoBuilder(); }

    public static final class PriceResultDtoBuilder {
        private String productName;
        private String brand;
        private String storeName;
        private BigDecimal price;
        private String currency;
        private String productUrl;
        private String imageUrl;
        private LocalDateTime fetchedAt;

        public PriceResultDtoBuilder productName(String v) { this.productName = v; return this; }
        public PriceResultDtoBuilder brand(String v) { this.brand = v; return this; }
        public PriceResultDtoBuilder storeName(String v) { this.storeName = v; return this; }
        public PriceResultDtoBuilder price(BigDecimal v) { this.price = v; return this; }
        public PriceResultDtoBuilder currency(String v) { this.currency = v; return this; }
        public PriceResultDtoBuilder productUrl(String v) { this.productUrl = v; return this; }
        public PriceResultDtoBuilder imageUrl(String v) { this.imageUrl = v; return this; }
        public PriceResultDtoBuilder fetchedAt(LocalDateTime v) { this.fetchedAt = v; return this; }

        public PriceResultDto build() {
            return new PriceResultDto(productName, brand, storeName, price, currency, productUrl, imageUrl, fetchedAt);
        }
    }
}
