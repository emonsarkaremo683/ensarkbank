package com.elitetech_inc.ensarkbank.account_management.account_transaction.controller;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.service.AccountTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/account-transaction/")
@RequiredArgsConstructor
public class AccountTransactionController {

    private final AccountTransactionService accountTransactionService;

    @PostMapping
    public ResponseEntity<AccountTransactionResponse> save(@RequestBody AccountTransactionRequest atr){
        return new ResponseEntity<>(accountTransactionService.save(atr), HttpStatus.CREATED);
    }

    @GetMapping("all/")
    public ResponseEntity<List<AccountTransactionResponse>> getAll(){
        return new ResponseEntity<>(accountTransactionService.findAll(), HttpStatus.OK);
    }

    @GetMapping("{id}")
    public ResponseEntity<AccountTransactionResponse> getById(@PathVariable Long id){
        return accountTransactionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("accountNumber/{accountNumber}")
    public ResponseEntity<List<AccountTransactionResponse>> findByAccountNumber(@PathVariable String accountNumber){
        return new ResponseEntity<>(
                accountTransactionService.findAllByAccountNumber(accountNumber),
                HttpStatus.OK
        );
    }

    @GetMapping("account/{accountId}")
    public ResponseEntity<List<AccountTransactionResponse>> findByAccountId(@PathVariable Long accountId){
        return new ResponseEntity<>(accountTransactionService.findByAccountId(accountId), HttpStatus.OK);
    }

}
