package com.ensark.ensarkbank.account_management.loan.service;

import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationRequest;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationResponse;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanRepaymentResponse;

import java.util.List;

public interface LoanService {
    LoanApplicationResponse applyLoan(LoanApplicationRequest loanApplicationRequest);
    LoanApplicationResponse approve(Long loanId);
    LoanApplicationResponse reject(Long loanId, String reason);
    LoanApplicationResponse getLoanById(Long loanId);
    List<LoanApplicationResponse> getLoansByAccount(Long accountId);
    List<LoanApplicationResponse> getLoans();
    LoanRepaymentResponse payInstallment(Long loanRepaymentId);
    List<LoanRepaymentResponse> getRepaymentsByLoan(Long loanId);
}
