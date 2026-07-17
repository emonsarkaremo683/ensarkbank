package com.ensark.ensarkbank.accounting_system.journal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JournalResponse {
    private Long id;
    private LocalDateTime date;
    private String transactionId;
    private String particulars;
    private String accountNumber;
    private String counterpartyAccountNumber;
    private String counterpartyName;
    private String entryType;
    private BigDecimal amount;
    private String transactionType;
    private String channel;
    private String status;
    private String remarks;
}
