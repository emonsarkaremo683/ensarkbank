package com.ensark.ensarkbank.accounting_system.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class LedgerResponse {
    private Long branchId;
    private String branchName;
    private String accountNumber;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private List<LedgerLineResponse> entries;
}
