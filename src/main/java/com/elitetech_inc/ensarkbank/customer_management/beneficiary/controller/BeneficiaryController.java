package com.elitetech_inc.ensarkbank.customer_management.beneficiary.controller;

import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.request.BeneficiaryRequest;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.response.BeneficiaryResponse;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.service.BeneficiaryService;
import com.elitetech_inc.ensarkbank.common.security.CustomerSecurity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/beneficiary/")
@RequiredArgsConstructor
public class BeneficiaryController {
    private final BeneficiaryService beneficiaryService;
    private final CustomerSecurity customerSecurity;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<BeneficiaryResponse> create(@RequestBody BeneficiaryRequest b, Authentication auth){
        Long customerId = customerSecurity.getAuthenticatedCustomerId(auth);
        if (customerId != null) {
            b.setCustomerId(customerId);
        }
        return ResponseEntity.ok(beneficiaryService.save(b));
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<BeneficiaryResponse>> findAll(Authentication auth){
        Long customerId = customerSecurity.getAuthenticatedCustomerId(auth);
        if (customerId != null) {
            return ResponseEntity.ok(beneficiaryService.findByCustomerId(customerId));
        }
        return ResponseEntity.ok(beneficiaryService.getAll());
    }

    @PreAuthorize("hasRole('CUSTOMER') and @customerSecurity.isBeneficiaryOwner(#id, authentication)")
    @GetMapping("{id}")
    public ResponseEntity<Optional<BeneficiaryResponse>> findById(@PathVariable Long id){
        return ResponseEntity.ok(beneficiaryService.findById(id));
    }

    @PreAuthorize("hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication)")
    @GetMapping("customer/{id}")
    public ResponseEntity<List<BeneficiaryResponse>> findByCustomerId(@PathVariable Long id){
        return ResponseEntity.ok(beneficiaryService.findByCustomerId(id));
    }

    @PreAuthorize("hasRole('CUSTOMER') and @customerSecurity.isBeneficiaryOwner(#id, authentication)")
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteById(@PathVariable Long id){
        beneficiaryService.delete(id);
        return ResponseEntity.ok("Successfully deleted beneficiary");
    }
}
