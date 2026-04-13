package com.goodeal.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Top-level API response DTO wrapping all price results for a search query.
 */
public record SearchResponseDto(
        String query,
        int totalResults,
        List<PriceResultDto> results,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime searchedAt
) {

    public static SearchResponseDtoBuilder builder() { return new SearchResponseDtoBuilder(); }

    public static final class SearchResponseDtoBuilder {
        private String query;
        private int totalResults;
        private List<PriceResultDto> results;
        private LocalDateTime searchedAt;

        public SearchResponseDtoBuilder query(String v) { this.query = v; return this; }
        public SearchResponseDtoBuilder totalResults(int v) { this.totalResults = v; return this; }
        public SearchResponseDtoBuilder results(List<PriceResultDto> v) { this.results = v; return this; }
        public SearchResponseDtoBuilder searchedAt(LocalDateTime v) { this.searchedAt = v; return this; }

        public SearchResponseDto build() {
            return new SearchResponseDto(query, totalResults, results, searchedAt);
        }
    }
}
