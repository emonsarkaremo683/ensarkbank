package com.ensark.ensarkbank.accounting_system.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BalanceSheetSectionLine {
    private String glCode;
    private String accountName;
    private BigDecimal amount;
}
