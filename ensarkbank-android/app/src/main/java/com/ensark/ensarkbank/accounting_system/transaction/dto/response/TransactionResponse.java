package com.ensark.ensarkbank.accounting_system.transaction.dto.response;

import com.ensark.ensarkbank.accounting_system.journal.dto.JournalResponse;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class TransactionResponse {
    private String transactionId;

    private String referenceNo;
    private String transactionType;
    private String channel;

    private String status;
    private BigDecimal amount;
    private BigDecimal chargeAmount;
    private BigDecimal vatAmount;
    private String remarks;
    private LocalDateTime createdAt;

    private List<JournalResponse> journals = new ArrayList<>();
}
