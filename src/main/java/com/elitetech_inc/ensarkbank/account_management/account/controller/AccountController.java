package com.elitetech_inc.ensarkbank.account_management.account.controller;


import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.request.AccountHolderRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.service.AccountService;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.common.security.BranchAccessService;
import com.elitetech_inc.ensarkbank.common.security.CustomerSecurity;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/account/")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final ObjectMapper objectMapper;
    private final CustomerSecurity customerSecurity;
    private final BranchAccessService branchAccessService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'CUSTOMER')")
    @PostMapping("create")
    public ResponseEntity<AccountResponse> addAccount(
            @RequestPart("data") String data,
            // Signatures
            @RequestPart(value = "signatures", required = true) List<MultipartFile> signatures,
            // nominee
            @RequestPart(value = "photo", required = true) MultipartFile photo,
            @RequestPart(value = "nid_front", required = true) MultipartFile nid_front,
            @RequestPart(value = "nid_back", required = true) MultipartFile nid_back,
            Authentication auth
    ) throws Exception {
        AccountRequest dto = objectMapper.readValue(data, AccountRequest.class);

        Long customerId = customerSecurity.getAuthenticatedCustomerId(auth);
        if (customerId != null && dto.getAccountHolders() != null) {
            for (AccountHolderRequest holder : dto.getAccountHolders()) {
                holder.setCustomerId(customerId);
            }
        }

        Map<String, MultipartFile> signatureMap = new HashMap<>();
        if (signatures != null) {
            AtomicInteger index = new AtomicInteger(0);
            for (MultipartFile sig : signatures) {
                signatureMap.put("signature_" + index.getAndIncrement(), sig);
            }
        }

        Map<String, MultipartFile> nominees = new HashMap<>();
        nominees.put("photo", photo);
        nominees.put("nid_front", nid_front);
        nominees.put("nid_back", nid_back);
        return new ResponseEntity<>(accountService.createAccount(dto, signatureMap, nominees), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'CASHIER')")
    @GetMapping("all/")
    public ResponseEntity<List<AccountResponse>> getAllAccounts(Authentication auth) {
        List<Long> branchIds = branchAccessService.getAccessibleBranchIds(auth);
        if (branchIds == null) {
            return new ResponseEntity<>(accountService.getAccounts(), HttpStatus.OK);
        }
        return new ResponseEntity<>(accountService.getAccountsByBranchIds(branchIds), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'CASHIER') or (hasRole('CUSTOMER') and @customerSecurity.isOwner(#id, authentication))")
    @GetMapping("{id:\\d+}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Long id) {
        return accountService.getAccount(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE')")
    @PatchMapping("{id}/status/{status}")
    public ResponseEntity<AccountResponse> setAccountStatus(@PathVariable Long id, @PathVariable AccountStatus status) {
        return ResponseEntity.ok(accountService.updateAccountStatus(id, status));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'CUSTOMER')")
    @GetMapping("account-number/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccountByAccountNumber(@PathVariable String accountNumber) {
        return accountService.getAccountByAccountNumber(accountNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR')")
    @GetMapping("branch/{branchId}")
    public ResponseEntity<List<AccountResponse>> getAccountsByBranchId(@PathVariable Long branchId) {
        return ResponseEntity.ok(accountService.getAccountsByBranchId(branchId));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR')")
    @GetMapping("branch/{branchId}/all")
    public ResponseEntity<List<AccountResponse>> getAccountsByBranchAndChildren(@PathVariable Long branchId, Authentication auth) {
        if (branchAccessService.isHeadOffice(auth)) {
            return ResponseEntity.ok(accountService.getAccounts());
        }
        List<Long> branchIds = accountService.resolveBranchAndChildIds(branchId);
        return ResponseEntity.ok(accountService.getAccountsByBranchIds(branchIds));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#customerId, authentication))")
    @GetMapping("customer/{customerId}")
    public ResponseEntity<List<AccountResponse>> getAccountsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(accountService.getAccountsByCustomerId(customerId));
    }

}