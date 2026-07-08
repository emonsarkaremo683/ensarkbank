package com.elitetech_inc.ensarkbank.accounting_system.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LedgerLineResponse {
    private Long journalId;
    private LocalDateTime date;
    private String transactionId;
    private String particulars;
    private String accountNumber;
    private String accountName;
    private BigDecimal debit;
    private BigDecimal credit;
    private BigDecimal balance;
}
