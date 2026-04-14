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
     */
    public record ChatActionFilters(long[] priceRange, List<String> brands) {}
}
