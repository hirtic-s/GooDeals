package com.goodeal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for the AI chat endpoint.
 */
public record ChatRequest(
        @NotBlank(message = "Message must not be blank")
        @Size(max = 500, message = "Message must not exceed 500 characters")
        String message
) {}
