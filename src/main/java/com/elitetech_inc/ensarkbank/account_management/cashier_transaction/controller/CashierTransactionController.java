package com.elitetech_inc.ensarkbank.account_management.cashier_transaction.controller;

import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.service.CashierTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cashier-transactions")
@RequiredArgsConstructor
public class CashierTransactionController {

    private final CashierTransactionService cashierTransactionService;

    @PreAuthorize("hasAnyRole('CASHIER', 'BRANCH_MANAGER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<CashierTransactionResponse> createTransaction(
            @Valid @RequestBody CashierTransactionRequest request) {
        return new ResponseEntity<>(cashierTransactionService.createTransaction(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('CASHIER', 'BRANCH_MANAGER', 'ADMIN', 'ACCOUNTANT', 'AUDITOR')")
    @GetMapping("/{id}")
    public ResponseEntity<CashierTransactionResponse> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(cashierTransactionService.getTransactionById(id));
    }

    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN', 'ACCOUNTANT', 'AUDITOR')")
    @GetMapping
    public ResponseEntity<List<CashierTransactionResponse>> getAllTransactions() {
        return ResponseEntity.ok(cashierTransactionService.getAllTransactions());
    }

    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CashierTransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody CashierTransactionRequest request) {
        return ResponseEntity.ok(cashierTransactionService.updateTransaction(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        cashierTransactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}