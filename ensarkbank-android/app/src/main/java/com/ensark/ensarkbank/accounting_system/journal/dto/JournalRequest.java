package com.ensark.ensarkbank.accounting_system.journal.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class JournalRequest {
    private Long account_id;
    private String accountNumber;
    private String entryType;
    private BigDecimal amount;
}
