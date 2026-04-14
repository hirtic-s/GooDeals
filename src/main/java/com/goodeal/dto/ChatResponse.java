package com.goodeal.dto;

/**
 * Response payload from the AI chat endpoint.
 *
 * @param reply  GooBot's conversational response text
 * @param action optional structured command the frontend should execute (null = chat-only reply)
 */
public record ChatResponse(String reply, ChatAction action) {

    /** Convenience constructor for replies that carry no executable action. */
    public ChatResponse(String reply) {
        this(reply, null);
    }
}
