package com.ensark.ensarkbank.accounting_system.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TrialBalanceResponse {
    private Long branchId;
    private String branchName;
    private List<TrialBalanceLineResponse> lines;
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
}
