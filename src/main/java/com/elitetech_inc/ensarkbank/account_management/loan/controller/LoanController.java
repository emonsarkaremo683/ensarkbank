package com.elitetech_inc.ensarkbank.account_management.loan.controller;

import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationRequest;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationResponse;
import com.elitetech_inc.ensarkbank.account_management.loan.entity.LoanRepayment;
import com.elitetech_inc.ensarkbank.account_management.loan.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans/")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PreAuthorize("hasAnyRole('CUSTOMER', 'LOAN_OFFICER', 'CASHIER')")
    @PostMapping("apply")
    public ResponseEntity<LoanApplicationResponse> apply(@Valid @RequestBody LoanApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.applyLoan(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR')")
    @GetMapping("all")
    public ResponseEntity<List<LoanApplicationResponse>> getAllLoans() {
        return ResponseEntity.ok(loanService.getLoans());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR', 'CUSTOMER')")
    @GetMapping("{id}")
    public ResponseEntity<LoanApplicationResponse> getLoanById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR', 'CUSTOMER')")
    @GetMapping("account/{accountId}")
    public ResponseEntity<List<LoanApplicationResponse>> loansByAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(loanService.getLoansByAccount(accountId));
    }

    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN')")
    @PutMapping("{id}/approve")
    public ResponseEntity<LoanApplicationResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.approve(id));
    }

    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN')")
    @PutMapping("{id}/reject")
    public ResponseEntity<LoanApplicationResponse> reject(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(loanService.reject(id, reason));
    }

    @PreAuthorize("hasAnyRole('LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN', 'ACCOUNTANT')")
    @PostMapping("{id}/disburse")
    public ResponseEntity<LoanApplicationResponse> disburse(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.disburse(id));
    }

    @PreAuthorize("hasAnyRole('CASHIER', 'CUSTOMER', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN')")
    @PostMapping("repayments/{repaymentId}/pay")
    public ResponseEntity<LoanRepayment> payInstallment(@PathVariable Long repaymentId) {
        return ResponseEntity.ok(loanService.payInstallment(repaymentId));
    }
}