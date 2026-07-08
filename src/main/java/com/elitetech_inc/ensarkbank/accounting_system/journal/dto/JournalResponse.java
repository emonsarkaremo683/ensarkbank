package com.elitetech_inc.ensarkbank.accounting_system.journal.dto;

import com.elitetech_inc.ensarkbank.common.enums.EntryType;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
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
    private EntryType entryType;
    private BigDecimal amount;
}
