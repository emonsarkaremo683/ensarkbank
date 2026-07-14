package com.elitetech_inc.ensarkbank.customer_management.customer.controller;

import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.service.AccountService;
import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalResponse;
import com.elitetech_inc.ensarkbank.accounting_system.journal.service.JournalService;
import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.common.security.BranchAccessService;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer/")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final ObjectMapper objectMapper;
    private final AccountService accountService;
    private final JournalService journalService;
    private final BranchAccessService branchAccessService;

    /**
     * POST /api/customer/
     * form-data fields:
     *   - data          (String / JSON)
     *   - profile       (file, optional)
     *   - NID           (file, optional)
     *   - PASSPORT      (file, optional)
     *   - DRIVING_LICENSE (file, optional)
     *   - BIRTH_CERTIFICATE (file, optional)
     */
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CUSTOMER_SERVICE', 'CASHIER', 'BRANCH_MANAGER', 'ADMIN', 'CUSTOMER')")
    @PostMapping
    public CustomerResponse save(
            @RequestPart("data") String data,
            @RequestPart(value = "profile", required = false) MultipartFile profilePicture,

            // KYC document files
            @RequestPart(value = "NID",               required = false) MultipartFile nid,
            @RequestPart(value = "PASSPORT",          required = false) MultipartFile passport,
            @RequestPart(value = "DRIVING_LICENSE",   required = false) MultipartFile drivingLicense,
            @RequestPart(value = "BIRTH_CERTIFICATE", required = false) MultipartFile birthCertificate

    ) throws Exception {

        CustomerRequest dto = objectMapper.readValue(data, CustomerRequest.class);

        Map<DocumentType, MultipartFile> documents = new EnumMap<>(DocumentType.class);

        if (nid != null && !nid.isEmpty()) documents.put(DocumentType.NID, nid);
        if (passport != null && !passport.isEmpty()) documents.put(DocumentType.PASSPORT, passport);
        if (drivingLicense != null && !drivingLicense.isEmpty()) documents.put(DocumentType.DRIVING_LICENSE, drivingLicense);
        if (birthCertificate != null && !birthCertificate.isEmpty()) documents.put(DocumentType.BIRTH_CERTIFICATE, birthCertificate);

        return customerService.saveData(dto, profilePicture, documents);
    }


    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE', 'ACCOUNTANT', 'AUDITOR')")
    @GetMapping
    public List<CustomerResponse> getAll(Authentication auth) {
        List<Long> branchIds = branchAccessService.getAccessibleBranchIds(auth);
        if (branchIds == null) {
            return customerService.getAll();
        }
        return customerService.getCustomersByBranchIds(branchIds);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE', 'CASHIER')")
    @GetMapping("search")
    public List<CustomerResponse> search(@RequestParam String query) {
        return customerService.searchCustomers(query);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE', 'CASHIER')")
    @GetMapping("email/{email}")
    public ResponseEntity<CustomerResponse> findByEmail(@PathVariable String email) {
        return customerService.findByUserEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE', 'CASHIER', 'ACCOUNTANT', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @GetMapping("{id}")
    public Optional<CustomerResponse> findById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CUSTOMER_SERVICE')")
    @PutMapping("{id}/kyc-status")
    public CustomerResponse changeKycStatus(@PathVariable Long id,
                                            @RequestParam KYCStatus status) {
        return customerService.changeKycStatus(id, status);
    }

    @PreAuthorize("hasAnyRole('CUSTOMER_SERVICE', 'CASHIER', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @PutMapping("{id}/kyc")
    public CustomerResponse changeKyc(
            @PathVariable Long id,
            @RequestPart(value = "NID",               required = false) MultipartFile nid,
            @RequestPart(value = "PASSPORT",          required = false) MultipartFile passport,
            @RequestPart(value = "DRIVING_LICENSE",   required = false) MultipartFile drivingLicense,
            @RequestPart(value = "BIRTH_CERTIFICATE", required = false) MultipartFile birthCertificate
    ) {
        Map<DocumentType, MultipartFile> documents = new EnumMap<>(DocumentType.class);

        if (nid != null && !nid.isEmpty()) documents.put(DocumentType.NID, nid);
        if (passport != null && !passport.isEmpty()) documents.put(DocumentType.PASSPORT, passport);
        if (drivingLicense != null && !drivingLicense.isEmpty()) documents.put(DocumentType.DRIVING_LICENSE, drivingLicense);
        if (birthCertificate != null && !birthCertificate.isEmpty()) documents.put(DocumentType.BIRTH_CERTIFICATE, birthCertificate);

        return customerService.changeKyc(id, documents);
    }

    @PreAuthorize("hasAnyRole('CUSTOMER_SERVICE', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @PutMapping("{id}")
    public CustomerResponse changeCustomerDetails(
            @PathVariable Long id,
            @RequestPart("data") String data,
            @RequestPart(value = "profile", required = false) MultipartFile profile
    ) throws Exception {
        CustomerRequest dto = objectMapper.readValue(data, CustomerRequest.class);
        return customerService.changeCustomerDetails(id, dto, profile);
    }

    @PreAuthorize("hasAnyRole('CUSTOMER_SERVICE', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @PutMapping("{id}/profile")
    public CustomerResponse changeProfilePic(
            @PathVariable Long id,
            @RequestPart("profile") MultipartFile profile
    ) {
        return customerService.changeProfilePic(id, profile);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @GetMapping("customer/{id}")
    public ResponseEntity<List<AccountResponse>> getAccountsByCustomerId(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountsByCustomerId(id));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @GetMapping("/history/customer/{id}")
    public ResponseEntity<List<JournalResponse>> getHistory(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                journalService.getJournalByAccountId(id, startDate, endDate)
        );
    }

}