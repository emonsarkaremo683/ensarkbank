package com.elitetech_inc.ensarkbank.account_management.loan.dto;

import com.elitetech_inc.ensarkbank.account_management.loan.entity.Loan;
import org.springframework.stereotype.Component;

@Component
public class LoanMapper {

    public LoanApplicationResponse toResponse(Loan loan) {
        LoanApplicationResponse response = new LoanApplicationResponse();
        response.setLoanId(loan.getId());
        response.setAccountId(loan.getAccount().getId());
        response.setAccountNumber(loan.getAccount().getAccountNumber());

        response.setPrincipalAmount(loan.getPrincipalAmount());
        response.setAnnualInterestRate(loan.getAnnualInterestRate());
        response.setTenureMonths(loan.getTenureMonths());

        response.setEmiAmount(loan.getEmiAmount());
        response.setTotalPayable(loan.getTotalPayable());
        response.setOutstandingBalance(loan.getOutstandingBalance());

        response.setStatus(loan.getStatus());

        response.setApplicationDate(loan.getApplicationDate());
        response.setApprovalDate(loan.getApprovalDate());
        response.setDisbursementDate(loan.getDisbursementDate());
        response.setNextDueDate(loan.getNextDueDate());

        response.setRejectionReason(loan.getRejectionReason());
        response.setDisbursementTransactionRef(loan.getDisbursementTransactionRef());

        return response;
    }

}
