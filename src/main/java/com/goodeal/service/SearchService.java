package com.goodeal.service;

import com.goodeal.dto.PriceResultDto;
import com.goodeal.entity.PriceHistory;
import com.goodeal.entity.Product;
import com.goodeal.repository.PriceHistoryRepository;
import com.goodeal.repository.ProductRepository;
import com.goodeal.scraper.PriceResult;
import com.goodeal.scraper.Scraper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Orchestrates parallel scraping, data persistence, and result aggregation.
 *
 * <p><b>Parallel execution flow:</b>
 * <ol>
 *   <li>For each registered {@link Scraper}, a {@link CompletableFuture} is submitted to
 *       a dedicated virtual-thread executor (Java 21 feature).</li>
 *   <li>{@link CompletableFuture#allOf} waits for all scrapers to complete.</li>
 *   <li>Results are flattened, persisted, sorted by price, and mapped to DTOs.</li>
 * </ol>
 */
@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final List<Scraper> scrapers;
    private final ProductRepository productRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    // Java 21 virtual-thread executor — lightweight and ideal for I/O-bound scraping tasks
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    public SearchService(List<Scraper> scrapers,
                         ProductRepository productRepository,
                         PriceHistoryRepository priceHistoryRepository) {
        this.scrapers = scrapers;
        this.productRepository = productRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    /**
     * Executes all scrapers in parallel for the given query.
     * Saves results to the database and returns a sorted, aggregated response.
     *
     * @param query the user-supplied search term
     * @return a {@link com.goodeal.dto.SearchResponseDto} with all results sorted ascending by price
     */
    @Transactional
    public com.goodeal.dto.SearchResponseDto search(String query) {
        log.info("Initiating parallel search for query: '{}'", query);
        LocalDateTime searchedAt = LocalDateTime.now();

        // Launch all scrapers concurrently using CompletableFuture
        List<CompletableFuture<List<PriceResult>>> futures = scrapers.stream()
                .map(scraper -> CompletableFuture.supplyAsync(
                        () -> safeScrape(scraper, query),
                        executor
                ))
                .toList();

        // Wait for all futures to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        // Flatten all results
        List<PriceResult> allResults = futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .toList();

        log.info("Total raw results collected: {}", allResults.size());

        // Persist results and map to DTOs
        List<PriceResultDto> dtos = persistAndMap(allResults, searchedAt);

        // Sort by price ascending (best deal first)
        dtos = dtos.stream()
                .sorted(Comparator.comparing(PriceResultDto::price))
                .toList();

        return com.goodeal.dto.SearchResponseDto.builder()
                .query(query)
                .totalResults(dtos.size())
                .results(dtos)
                .searchedAt(searchedAt)
                .build();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private List<PriceResult> safeScrape(Scraper scraper, String query) {
        try {
            return scraper.scrape(query);
        } catch (Exception e) {
            log.error("[{}] Unexpected error during scrape: {}", scraper.getStoreName(), e.getMessage(), e);
            return List.of();
        }
    }

    private List<PriceResultDto> persistAndMap(List<PriceResult> results, LocalDateTime fetchedAt) {
        List<PriceResultDto> dtos = new ArrayList<>();

        for (PriceResult r : results) {
            try {
                // Find or create the Product
                Product product = productRepository
                        .findByNameIgnoreCaseAndBrand(r.productName(), r.brand())
                        .orElseGet(() -> productRepository.save(
                                Product.builder()
                                        .name(r.productName())
                                        .brand(r.brand())
                                        .build()
                        ));

                // Create and save a new PriceHistory snapshot
                PriceHistory history = PriceHistory.builder()
                        .storeName(r.storeName())
                        .price(r.price())
                        .currency(r.currency())
                        .productUrl(r.productUrl())
                        .imageUrl(r.imageUrl())
                        .timestamp(fetchedAt)
                        .product(product)
                        .build();

                priceHistoryRepository.save(history);

                // Map to DTO
                dtos.add(PriceResultDto.builder()
                        .productName(r.productName())
                        .brand(r.brand())
                        .storeName(r.storeName())
                        .price(r.price())
                        .currency(r.currency())
                        .productUrl(r.productUrl())
                        .imageUrl(r.imageUrl())
                        .fetchedAt(fetchedAt)
                        .build());

            } catch (Exception e) {
                log.error("Failed to persist result for '{}' from '{}': {}",
                        r.productName(), r.storeName(), e.getMessage());
            }
        }

        return dtos;
    }
}
