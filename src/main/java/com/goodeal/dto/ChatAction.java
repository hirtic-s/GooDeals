package com.goodeal.dto;

import java.util.List;

/**
 * Optional action emitted by GooBot when it detects a search or filter intent.
 * Null when the user is just chatting with no product-search intent.
 */
public record ChatAction(
        String type,
        String query,
        ChatActionFilters filters
) {
    /**
     * Subset of filters the AI can set from a natural-language query.
     *
     * @param priceRange two-element array [minPrice, maxPrice] in ₹
     * @param brands     brand names to pre-select; empty list means no brand filter
     * @param rams       RAM options to pre-select (e.g. ["8GB", "16GB"]); empty list means no RAM filter
     * @param storages   storage options to pre-select (e.g. ["128GB", "256GB"]); empty list means no storage filter
     */
    public record ChatActionFilters(long[] priceRange, List<String> brands, List<String> rams, List<String> storages) {}
}
