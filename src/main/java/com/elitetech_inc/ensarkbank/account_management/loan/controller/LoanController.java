package com.elitetech_inc.ensarkbank.account_management.loan.controller;

import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationRequest;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationResponse;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanRepaymentResponse;
import com.elitetech_inc.ensarkbank.account_management.loan.service.LoanService;
import com.elitetech_inc.ensarkbank.common.security.CustomerSecurity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans/")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final CustomerSecurity customerSecurity;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'CASHIER') or (hasRole('CUSTOMER') and @customerSecurity.isOwner(#request.accountId, authentication))")
    @PostMapping("apply")
    public ResponseEntity<LoanApplicationResponse> apply(@Valid @RequestBody LoanApplicationRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.applyLoan(request));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR')")
    @GetMapping("all")
    public ResponseEntity<List<LoanApplicationResponse>> getAllLoans() {
        return ResponseEntity.ok(loanService.getLoans());
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isLoanOwner(#id, authentication))")
    @GetMapping("{id:\\d+}")
    public ResponseEntity<LoanApplicationResponse> getLoanById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanById(id));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'ACCOUNTANT', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isOwner(#accountId, authentication))")
    @GetMapping("account/{accountId}")
    public ResponseEntity<List<LoanApplicationResponse>> loansByAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(loanService.getLoansByAccount(accountId));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN')")
    @PutMapping("{id}/approve")
    public ResponseEntity<LoanApplicationResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.approve(id));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN')")
    @PutMapping("{id}/reject")
    public ResponseEntity<LoanApplicationResponse> reject(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(loanService.reject(id, reason));
    }

//    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN', 'ACCOUNTANT')")
//    @PostMapping("{id}/disburse")
//    public ResponseEntity<LoanApplicationResponse> disburse(@PathVariable Long id) {
//        return ResponseEntity.ok(loanService.disburse(id));
//    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN', 'CASHIER') or (hasRole('CUSTOMER') and @customerSecurity.isLoanOwner(#id, authentication))")
    @GetMapping("{id:\\d+}/repayments")
    public ResponseEntity<List<LoanRepaymentResponse>> getRepayments(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getRepaymentsByLoan(id));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'LOAN_OFFICER', 'BRANCH_MANAGER', 'ADMIN', 'CASHIER') or (hasRole('CUSTOMER') and @customerSecurity.isLoanRepaymentOwner(#repaymentId, authentication))")
    @PostMapping("repayments/{repaymentId}/pay")
    public ResponseEntity<LoanRepaymentResponse> payInstallment(@PathVariable Long repaymentId) {
        return ResponseEntity.ok(loanService.payInstallment(repaymentId));
    }
}