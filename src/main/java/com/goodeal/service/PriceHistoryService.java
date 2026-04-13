package com.goodeal.service;

import com.goodeal.dto.PriceResultDto;
import com.goodeal.entity.PriceHistory;
import com.goodeal.repository.PriceHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for querying stored price history records.
 */
@Service
public class PriceHistoryService {

    private static final Logger log = LoggerFactory.getLogger(PriceHistoryService.class);

    private final PriceHistoryRepository priceHistoryRepository;

    public PriceHistoryService(PriceHistoryRepository priceHistoryRepository) {
        this.priceHistoryRepository = priceHistoryRepository;
    }

    /**
     * Retrieves all price history entries for a product, ordered by timestamp descending.
     */
    public List<PriceResultDto> getHistoryForProduct(Long productId) {
        return priceHistoryRepository
                .findByProductIdOrderByTimestampDesc(productId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private PriceResultDto toDto(PriceHistory h) {
        return PriceResultDto.builder()
                .storeName(h.getStoreName())
                .price(h.getPrice())
                .currency(h.getCurrency())
                .productUrl(h.getProductUrl())
                .imageUrl(h.getImageUrl())
                .fetchedAt(h.getTimestamp())
                .build();
    }
}
