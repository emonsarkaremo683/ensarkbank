package com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request;

import java.math.BigDecimal;

import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;

import lombok.Data;

@Data
public class TransactionRequest {
    private TransactionType transactionType = TransactionType.TRANSFER;
    private TransactionChannel channel = TransactionChannel.INTERNET_BANKING;
    private BigDecimal amount;
    private String remarks;
}
