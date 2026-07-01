package com.elitetech_inc.ensarkbank.account_management.account_transaction.service;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.mapper.AccountTransactionMapper;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.repository.AccountTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountTransactionServiceImpl implements AccountTransactionService {

    private final AccountTransactionRepository accountTransactionRepository;
    private final AccountTransactionMapper accountTransactionMapper;

    @Override
    public AccountTransactionResponse save(AccountTransactionRequest accountTransactionRequest) {


        return null;
    }

    @Override
    public Optional<AccountTransactionResponse> findByAccountNumber(String accountNumber) {
        return Optional.empty();
    }

    @Override
    public List<AccountTransactionResponse> findAll() {
        return List.of();
    }
}
