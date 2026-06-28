package com.elitetech_inc.ensarkbank.customer_management.transaction.dto.response;

import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import lombok.Data;

@Data
public class AccountTransactionResponse {
    private String senderAccountNumber;
    private String accountNumber;
    private String name;
    private String bankName;

    private String referenceNo;
    private TransactionType transactionType;
    private TransactionChannel channel;
    private TransactionStatus status;
    private Double amount;
    private Double chargeAmount;
    private Double vatAmount;
    private String remarks;
}
