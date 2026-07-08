package com.elitetech_inc.ensarkbank.accounting_system.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TrialBalanceLineResponse {
    private String glCode;
    private String accountName;
    private String accountNumber;
    private BigDecimal debit;
    private BigDecimal credit;
}
