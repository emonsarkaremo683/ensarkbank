package com.elitetech_inc.ensarkbank.account_management.card.controller;

import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.card.service.CardService;
import com.elitetech_inc.ensarkbank.common.enums.CardStatus;
import com.elitetech_inc.ensarkbank.common.enums.CardType;
import com.elitetech_inc.ensarkbank.common.security.CustomerSecurity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/card/")
@RequiredArgsConstructor
public class CardController {
    private final CardService cardService;
    private final CustomerSecurity customerSecurity;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE', 'CUSTOMER')")
    @PostMapping
    public ResponseEntity<CardResponse> createCard(@RequestBody CardRequest cr, Authentication auth) {
        Long customerId = customerSecurity.getAuthenticatedCustomerId(auth);
        return ResponseEntity.ok(cardService.createCard(cr, customerId));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CUSTOMER_SERVICE', 'AUDITOR')")
    @GetMapping
    public ResponseEntity<List<CardResponse>> getAllCards() {
        return ResponseEntity.ok(cardService.getAll());
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE', 'CASHIER') or (hasRole('CUSTOMER') and @customerSecurity.isOwner(#id, authentication))")
    @GetMapping("account/{id}")
    public ResponseEntity<Optional<CardResponse>> getCardByAccountId(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.findCardByAccountId(id));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE', 'CASHIER') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @GetMapping("customer/{id}")
    public ResponseEntity<Optional<CardResponse>> getCardByCustomerId(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.findCardsByCustomerId(id));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE')")
    @PatchMapping("{id}/status")
    public ResponseEntity<CardResponse> updateCardStatus(@PathVariable Long id, @RequestParam CardStatus status,@RequestParam double dailyLimit, @RequestParam double monthlyLimit) {
        return ResponseEntity.ok(cardService.updateCardStatus(id, status, dailyLimit, monthlyLimit));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE')")
    @PatchMapping("{id}/type")
    public ResponseEntity<CardResponse> updateCardType(@PathVariable Long id, @RequestParam CardType type) {
        return ResponseEntity.ok(cardService.updateCardType(id, type));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE') or (hasRole('CUSTOMER') and @customerSecurity.isCardOwner(#id, authentication))")
    @PatchMapping("{id}/international")
    public ResponseEntity<CardResponse> enableInternationalTransaction(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(cardService.enableInternationalTransaction(id, enabled));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE') or (hasRole('CUSTOMER') and @customerSecurity.isCardOwner(#id, authentication))")
    @PatchMapping("{id}/change-pin")
    public ResponseEntity<CardResponse> updateCardPin(@PathVariable Long id, @RequestParam String pin) {
        return ResponseEntity.ok(cardService.updateCardPin(id, pin));
    }
}
