package com.goodeal.controller;

import com.goodeal.dto.PriceResultDto;
import com.goodeal.service.PriceHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing price history endpoints.
 */
@RestController
@RequestMapping("/api/v1/products")
public class PriceHistoryController {

    private final PriceHistoryService priceHistoryService;

    public PriceHistoryController(PriceHistoryService priceHistoryService) {
        this.priceHistoryService = priceHistoryService;
    }

    /**
     * Retrieve the full price history for a given product.
     *
     * <p><b>Example:</b> {@code GET /api/v1/products/42/history}
     *
     * @param productId the database ID of the product
     * @return list of price history DTOs ordered by most-recent first
     */
    @GetMapping("/{productId}/history")
    public ResponseEntity<List<PriceResultDto>> getHistory(@PathVariable Long productId) {
        return ResponseEntity.ok(priceHistoryService.getHistoryForProduct(productId));
    }
}
