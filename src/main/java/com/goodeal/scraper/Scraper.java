package com.goodeal.scraper;

import java.util.List;

/**
 * Contract that every price scraper must implement.
 * Each implementation targets a specific e-commerce store and is responsible
 * for fetching live price data for a given search query.
 */
public interface Scraper {

    /**
     * Scrape product listings for the given query from the underlying store.
     *
     * @param query the search term entered by the user
     * @return a (possibly empty) list of {@link PriceResult} objects; never null
     */
    List<PriceResult> scrape(String query);

    /**
     * Returns the human-readable store name handled by this scraper.
     * Used for logging and DTO population.
     */
    String getStoreName();
}
