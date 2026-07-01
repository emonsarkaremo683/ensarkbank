package com.elitetech_inc.ensarkbank.customer_management.transaction.dto.response;

import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    // FIX: BigDecimal
    private BigDecimal amount;
    private BigDecimal chargeAmount;
    private BigDecimal vatAmount;
    private BigDecimal totalDebitAmount;

    private String remarks;
    private LocalDateTime transactionDate;
}
