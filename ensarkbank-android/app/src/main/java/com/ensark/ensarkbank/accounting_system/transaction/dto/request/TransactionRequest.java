package com.ensark.ensarkbank.accounting_system.transaction.dto.request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class TransactionRequest {
    private BigDecimal amount;
    private String remarks;
}
