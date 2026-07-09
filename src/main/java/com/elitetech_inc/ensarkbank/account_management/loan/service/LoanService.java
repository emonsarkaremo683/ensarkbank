package com.elitetech_inc.ensarkbank.account_management.loan.service;

import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationRequest;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationResponse;
import com.elitetech_inc.ensarkbank.account_management.loan.entity.LoanRepayment;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface LoanService {
    LoanApplicationResponse applyLoan(LoanApplicationRequest loanApplicationRequest);
    LoanApplicationResponse approve(Long loanId);
    LoanApplicationResponse reject(Long loanId, String reason);
    LoanApplicationResponse disburse(Long loanId);
    LoanApplicationResponse getLoanById(Long loanId);
    List<LoanApplicationResponse> getLoansByAccount(Long accountId);
    List<LoanApplicationResponse> getLoans();
    LoanRepayment payInstallment(Long loanRepaymentId);
}
