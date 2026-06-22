package com.elitetech_inc.ensarkbank.customer_management.card.controller;

import com.elitetech_inc.ensarkbank.customer_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.customer_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.customer_management.card.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/card/")
@RequiredArgsConstructor
public class CardController {
    private final CardService cardService;

    @PostMapping
    public CardResponse save(@RequestBody CardRequest cr){
        return cardService.save(cr);
    }

    @PutMapping("{id}")
    public CardResponse update(@PathVariable Long id, @RequestBody CardRequest cr){
        return cardService.update(id, cr);
    }

    @GetMapping
    public List<CardResponse> getAll(){
        return cardService.getAll();
    }

    @DeleteMapping("{id}")
    public void delete(@PathVariable Long id){
        cardService.delete(id);
    }

    @GetMapping("{cardNumber}")
    public Optional<CardResponse> getByCardNumber(@PathVariable String cardNumber){
        return cardService.findByCardNumber(cardNumber);
    }

}
