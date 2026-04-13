package com.goodeal.dto;

/**
 * Generic error response DTO returned to API consumers when an error occurs.
 */
public record ErrorResponseDto(
        int status,
        String error,
        String message,
        String path
) {

    public static ErrorResponseDtoBuilder builder() { return new ErrorResponseDtoBuilder(); }

    public static final class ErrorResponseDtoBuilder {
        private int status;
        private String error;
        private String message;
        private String path;

        public ErrorResponseDtoBuilder status(int v) { this.status = v; return this; }
        public ErrorResponseDtoBuilder error(String v) { this.error = v; return this; }
        public ErrorResponseDtoBuilder message(String v) { this.message = v; return this; }
        public ErrorResponseDtoBuilder path(String v) { this.path = v; return this; }

        public ErrorResponseDto build() {
            return new ErrorResponseDto(status, error, message, path);
        }
    }
}
