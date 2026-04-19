package com.goodeal.dto;

import java.util.List;

/**
 * Response payload from the AI chat endpoint.
 *
 * @param reply  GooBot's conversational response text
 * @param action optional structured command the frontend should execute (null = chat-only reply)
 * @param items  top 3-5 best-value deals GooBot picked from live results (null = chat-only reply)
 */
public record ChatResponse(String reply, ChatAction action, List<PriceResultDto> items) {

    /** Convenience constructor for replies that carry no executable action or items. */
    public ChatResponse(String reply) {
        this(reply, null, null);
    }

    /** Convenience constructor for replies with an action but no inline items. */
    public ChatResponse(String reply, ChatAction action) {
        this(reply, action, null);
    }
}
