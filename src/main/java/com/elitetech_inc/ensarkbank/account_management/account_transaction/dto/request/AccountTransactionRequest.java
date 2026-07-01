package com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request;

import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountTransactionRequest {

    private Long senderId;

    private String receiverAccountNumber;
    private String receiverName;
    private String bankName;

    // if beneficiary exists
    private Long beneficiaryId;

    private TransactionRequest request;


}
