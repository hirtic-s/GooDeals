package com.goodeal.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a distinct product identified by name and brand.
 * One Product can have many PriceHistory records across different stores.
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String brand;

    @Column
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PriceHistory> priceHistories = new ArrayList<>();

    // --- Constructors ---

    public Product() {}

    public Product(Long id, String name, String brand, String category, String description) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.description = description;
    }

    // --- Static builder factory ---

    public static ProductBuilder builder() { return new ProductBuilder(); }

    public static final class ProductBuilder {
        private Long id;
        private String name;
        private String brand;
        private String category;
        private String description;

        public ProductBuilder id(Long v) { this.id = v; return this; }
        public ProductBuilder name(String v) { this.name = v; return this; }
        public ProductBuilder brand(String v) { this.brand = v; return this; }
        public ProductBuilder category(String v) { this.category = v; return this; }
        public ProductBuilder description(String v) { this.description = v; return this; }

        public Product build() {
            Product p = new Product();
            p.id = this.id;
            p.name = this.name;
            p.brand = this.brand;
            p.category = this.category;
            p.description = this.description;
            return p;
        }
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<PriceHistory> getPriceHistories() { return priceHistories; }
    public void setPriceHistories(List<PriceHistory> priceHistories) { this.priceHistories = priceHistories; }
}
