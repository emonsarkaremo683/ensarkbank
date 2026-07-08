package com.elitetech_inc.ensarkbank.accounting_system.journal.dto;

import com.elitetech_inc.ensarkbank.common.enums.EntryType;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JournalResponse {
    private LocalDateTime date;
    private String transactionId;
    private String accountName;
    private String accountNumber;
    private TransactionChannel channel;
    private EntryType entryType;
    private BigDecimal amount;
}
