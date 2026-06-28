package com.elitetech_inc.ensarkbank.customer_management.transaction.controller;

import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.customer_management.transaction.service.AccountTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/account-transactions")
@RequiredArgsConstructor
public class AccountTransactionController {

    // 1. Inject the service to handle the business logic (saving the transaction).
    private final AccountTransactionService accountTransactionService;

    // 2. This is a POST API endpoint to create a new transaction.
    // Use @RequestBody to map the incoming JSON to our AccountTransaction object.
    @PostMapping
    public ResponseEntity<AccountTransaction> createTransaction(@RequestBody AccountTransaction accountTransaction) {
        
        // Step 1: Call the service to save the transaction.
        AccountTransaction savedTransaction = accountTransactionService.createAccountTransaction(accountTransaction);
        
        // Step 2: Return a successful response (HTTP 200 OK) with the saved data.
        return ResponseEntity.ok(savedTransaction);
    }
}
