package com.elitetech_inc.ensarkbank.customer_management.transaction.dto.request;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import lombok.Data;

@Data
public class AccountTransactionRequest {

    private Account sender;
    private String accountNumber;
    private String name;
    private String bankName;

}
