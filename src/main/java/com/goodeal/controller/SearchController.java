package com.goodeal.controller;

import com.goodeal.dto.SearchResponseDto;
import com.goodeal.service.SearchService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing the product price search API.
 * All endpoints are versioned under {@code /api/v1}.
 */
@RestController
@RequestMapping("/api/v1")
@Validated
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Search for product prices across all registered stores.
     *
     * <p><b>Example:</b> {@code GET /api/v1/search?query=iPhone+15}
     *
     * @param query the product search term (1–200 characters, required)
     * @return {@link SearchResponseDto} with results sorted by price ascending
     */
    @GetMapping("/search")
    public ResponseEntity<SearchResponseDto> search(
            @RequestParam("query")
            @NotBlank(message = "Query must not be blank")
            @Size(min = 1, max = 200, message = "Query must be between 1 and 200 characters")
            String query) {

        SearchResponseDto response = searchService.search(query.trim());
        return ResponseEntity.ok(response);
    }
}
