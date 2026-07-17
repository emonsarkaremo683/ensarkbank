package com.ensark.ensarkbank.account_management.loan.dto;

import com.elitetech_inc.ensarkbank.common.enums.LoanStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LoanApplicationResponse {

    private Long loanId;
    private Long accountId;
    private String accountNumber;

    private BigDecimal principalAmount;
    private BigDecimal annualInterestRate;
    private Integer tenureMonths;

    private BigDecimal emiAmount;
    private BigDecimal totalPayable;
    private BigDecimal outstandingBalance;

    private LoanStatus status;

    private LocalDate applicationDate;
    private LocalDate approvalDate;
    private LocalDate disbursementDate;
    private LocalDate nextDueDate;

    private String rejectionReason;
    private String disbursementTransactionRef;
}
