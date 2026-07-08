package com.elitetech_inc.ensarkbank.accounting_system.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BalanceSheetResponse {
    private Long branchId;
    private String branchName;
    private BalanceSheetSection assets;
    private BalanceSheetSection liabilities;
    private BalanceSheetSection equity;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilitiesAndEquity;
}
