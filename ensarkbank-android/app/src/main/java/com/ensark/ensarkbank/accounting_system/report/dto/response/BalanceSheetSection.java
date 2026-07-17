package com.ensark.ensarkbank.accounting_system.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class BalanceSheetSection {
    private String title;
    private List<BalanceSheetSectionLine> lines;
    private BigDecimal total;
}
