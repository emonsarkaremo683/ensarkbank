package com.elitetech_inc.ensarkbank.customer_management.transaction.service;

import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import org.springframework.stereotype.Service;

@Service
public interface AccountTransactionService {

    AccountTransaction createAccountTransaction(AccountTransaction accountTransaction);
}
