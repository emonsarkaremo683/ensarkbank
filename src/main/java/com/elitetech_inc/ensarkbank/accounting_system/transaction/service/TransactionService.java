package com.elitetech_inc.ensarkbank.accounting_system.transaction.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import org.springframework.stereotype.Service;

@Service
public interface TransactionService {

    TransactionResponse createTransaction(TransactionRequest tr, Transaction t,
                                          Account cashVault,
                                          Account customerAccount);
}
