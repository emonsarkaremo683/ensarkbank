package com.elitetech_inc.ensarkbank.account_management.card.controller;

import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.card.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/card/")
@RequiredArgsConstructor
public class CardController {
    private final CardService cardService;

    @PostMapping
    public ResponseEntity<CardResponse> createCard(@RequestBody CardRequest cr) {
        return ResponseEntity.ok(cardService.createCard(cr));
    }

    @GetMapping
    public ResponseEntity<List<CardResponse>> getAllCards() {
        return ResponseEntity.ok(cardService.getAll());
    }

    @GetMapping("account/{id}")
    public ResponseEntity<Optional<CardResponse>> getCardByAccountId(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.findCardByAccountId(id));
    }

    @GetMapping("customer/{id}")
    public ResponseEntity<Optional<CardResponse>> getCardByCustomerId(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.findCardsByCustomerId(id));
    }

}
