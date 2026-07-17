package com.ensark.ensarkbank.atm_management.atm_transaction.dto;

import com.ensark.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import lombok.Data;

@Data
public class ATMTransactionRequest {
    private Long atmId;
    private String cardNumber;
    private String transactionType;
    private String pin;
    private TransactionRequest transactionRequest;
}
