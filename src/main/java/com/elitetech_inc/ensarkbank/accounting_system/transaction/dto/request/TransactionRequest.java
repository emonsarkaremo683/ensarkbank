package com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request;

import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalRequest;
import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.Journal;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class TransactionRequest {
    private BigDecimal amount;
    private String remarks;

    private List<JournalRequest>journals = new ArrayList<>();
}
