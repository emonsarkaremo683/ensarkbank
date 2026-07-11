package com.elitetech_inc.ensarkbank.account_management.account_transaction.controller;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.OtpVerifyRequest;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.OtpInitiateResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.service.AccountTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/account-transaction/")
@RequiredArgsConstructor
public class AccountTransactionController {

    private final AccountTransactionService accountTransactionService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'CASHIER', 'CUSTOMER')")
    @PostMapping
    public ResponseEntity<AccountTransactionResponse> save(@RequestBody AccountTransactionRequest atr){
        return new ResponseEntity<>(accountTransactionService.save(atr), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')")
    @PostMapping("online/initiate")
    public ResponseEntity<OtpInitiateResponse> initiateOnlineTransaction(@RequestBody AccountTransactionRequest atr){
        return new ResponseEntity<>(accountTransactionService.initiateOnlineTransaction(atr), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'CUSTOMER')")
    @PostMapping("online/verify")
    public ResponseEntity<AccountTransactionResponse> verifyOnlineTransaction(@RequestBody OtpVerifyRequest req){
        return new ResponseEntity<>(accountTransactionService.verifyOnlineTransaction(req), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'AUDITOR')")
    @GetMapping("all/")
    public ResponseEntity<List<AccountTransactionResponse>> getAll(){
        return new ResponseEntity<>(accountTransactionService.findAll(), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'CUSTOMER', 'AUDITOR')")
    @GetMapping("{id}")
    public ResponseEntity<AccountTransactionResponse> getById(@PathVariable Long id){
        return accountTransactionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'CUSTOMER', 'AUDITOR')")
    @GetMapping("accountNumber/{accountNumber}")
    public ResponseEntity<List<AccountTransactionResponse>> findByAccountNumber(@PathVariable String accountNumber){
        return new ResponseEntity<>(
                accountTransactionService.findAllByAccountNumber(accountNumber),
                HttpStatus.OK
        );
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'CUSTOMER', 'AUDITOR')")
    @GetMapping("account/{accountId}")
    public ResponseEntity<List<AccountTransactionResponse>> findByAccountId(@PathVariable Long accountId){
        return new ResponseEntity<>(accountTransactionService.findByAccountId(accountId), HttpStatus.OK);
    }

}
