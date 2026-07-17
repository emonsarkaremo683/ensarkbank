package com.ensark.ensarkbank.atm_management.atm_transaction.dto;


import com.ensark.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ATMTransactionResponse {

    private Long ATMTransactionId;
    private String transactionType;
    private String cardNumber;
    private String address;

    private TransactionResponse transactionResponse;

}
