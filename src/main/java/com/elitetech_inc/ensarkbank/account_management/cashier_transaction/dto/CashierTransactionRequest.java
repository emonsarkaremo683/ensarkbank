package com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto;

import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import lombok.Data;

@Data
public class CashierTransactionRequest {
    private String checkNo;
    private Long branchId; // cashier's branch
    private String accountNumber;
    private String accountName;
    private String bankName;
    private String routingNumber; // receiver branch
    private TransactionRequest transactionRequest;
}
