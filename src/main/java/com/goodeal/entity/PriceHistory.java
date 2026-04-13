package com.goodeal.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stores a price observation for a product at a specific store and point in time.
 */
@Entity
@Table(name = "price_histories", indexes = {
        @Index(name = "idx_price_histories_product_id", columnList = "product_id"),
        @Index(name = "idx_price_histories_timestamp", columnList = "timestamp")
})
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String storeName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String productUrl;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // --- Lifecycle ---

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // --- Constructors ---

    public PriceHistory() {}

    // --- Static builder factory ---

    public static PriceHistoryBuilder builder() { return new PriceHistoryBuilder(); }

    public static final class PriceHistoryBuilder {
        private Long id;
        private String storeName;
        private BigDecimal price;
        private String currency;
        private String productUrl;
        private String imageUrl;
        private LocalDateTime timestamp;
        private Product product;

        public PriceHistoryBuilder id(Long v) { this.id = v; return this; }
        public PriceHistoryBuilder storeName(String v) { this.storeName = v; return this; }
        public PriceHistoryBuilder price(BigDecimal v) { this.price = v; return this; }
        public PriceHistoryBuilder currency(String v) { this.currency = v; return this; }
        public PriceHistoryBuilder productUrl(String v) { this.productUrl = v; return this; }
        public PriceHistoryBuilder imageUrl(String v) { this.imageUrl = v; return this; }
        public PriceHistoryBuilder timestamp(LocalDateTime v) { this.timestamp = v; return this; }
        public PriceHistoryBuilder product(Product v) { this.product = v; return this; }

        public PriceHistory build() {
            PriceHistory h = new PriceHistory();
            h.id = this.id;
            h.storeName = this.storeName;
            h.price = this.price;
            h.currency = this.currency;
            h.productUrl = this.productUrl;
            h.imageUrl = this.imageUrl;
            h.timestamp = this.timestamp;
            h.product = this.product;
            return h;
        }
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getProductUrl() { return productUrl; }
    public void setProductUrl(String productUrl) { this.productUrl = productUrl; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}
