package com.elitetech_inc.ensarkbank.customer_management.transaction.service;

import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.customer_management.transaction.repository.AccountTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountTransactionServiceImpl implements AccountTransactionService {

    // 1. We inject the repository to talk to the database. This allows us to save or read data.
    private final AccountTransactionRepository accountTransactionRepository;

    @Override
    public AccountTransaction createAccountTransaction(AccountTransaction accountTransaction) {
        // Step 1: Save the account transaction to the database.
        // In a real scenario, you might want to call TransactionPostingService here to deduct/add balances.
        // For beginner simplicity, we just save the record directly.
        return accountTransactionRepository.save(accountTransaction);
    }
}
