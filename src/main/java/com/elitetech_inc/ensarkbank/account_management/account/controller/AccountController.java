package com.elitetech_inc.ensarkbank.account_management.account.controller;


import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.service.AccountService;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/account/")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final ObjectMapper objectMapper;

    @PreAuthorize("hasAnyRole('CUSTOMER', 'CASHIER')")
    @PostMapping("create")
    public ResponseEntity<AccountResponse> addAccount(
            @RequestPart("data") String data,

            // nominee
            @RequestPart(value = "photo", required = true) MultipartFile photo,
            @RequestPart(value = "nid_front", required = true) MultipartFile nid_front,
            @RequestPart(value = "nid_back", required = true) MultipartFile nid_back
    ){
        AccountRequest dto = objectMapper.readValue(data, AccountRequest.class);

        Map<String, MultipartFile> nominees = new HashMap<>();
        nominees.put("photo", photo);
        nominees.put("nid_front", nid_front);
        nominees.put("nid_back", nid_back);
        return new ResponseEntity<>(accountService.createAccount(dto, nominees), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE')")
    @GetMapping("all/")
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {
        return new ResponseEntity<>(accountService.getAccounts(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("{id}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Long id) {
        return accountService.getAccount(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE')")
    @PatchMapping("{id}/status/{status}")
    public ResponseEntity<AccountResponse> setAccountStatus(@PathVariable Long id, @PathVariable AccountStatus status) {
        return ResponseEntity.ok(accountService.updateAccountStatus(id, status));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'CUSTOMER')")
    @GetMapping("account-number/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccountByAccountNumber(@PathVariable String accountNumber) {
        return accountService.getAccountByAccountNumber(accountNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR')")
    @GetMapping("branch/{branchId}")
    public ResponseEntity<AccountResponse> getAccountsByBranchId(@PathVariable Long branchId) {
        return accountService.getAccountsByBranchId(branchId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'CUSTOMER')")
    @GetMapping("customer/{customerId}")
    public ResponseEntity<List<AccountResponse>> getAccountsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(accountService.getAccountsByCustomerId(customerId));
    }

}