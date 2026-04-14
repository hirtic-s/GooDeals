package com.goodeal.controller;

import com.goodeal.dto.ChatRequest;
import com.goodeal.dto.ChatResponse;
import com.goodeal.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing the GooDeals AI chat endpoint.
 */
@RestController
@RequestMapping("/api/v1")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Accepts a user message and returns a witty, price-aware recommendation.
     *
     * <p><b>Example:</b> {@code POST /api/v1/chat}
     * <pre>{"message": "Best gaming phone under 40k"}</pre>
     *
     * @param request the chat request body
     * @return {@link ChatResponse} with GooBot's recommendation
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody @Valid ChatRequest request) {
        ChatResponse response = chatService.chat(request.message().trim());
        return ResponseEntity.ok(response);
    }
}
