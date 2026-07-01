package com.elitetech_inc.ensarkbank.accounting_system.transaction.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.common.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.elitetech_inc.ensarkbank.common.enums.TransactionType.DEPOSIT;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final Utils utils;
    private final TransactionPostingService transactionPostingService;

    @Override
    public TransactionResponse createTransaction(TransactionRequest tr, Transaction t, Account cashVault,
                                                 Account customerAccount) {

        t = transactionMapper.toTransaction(tr);
        t.setTransactionId(utils.generateReference());
        t.setReferenceNo(utils.generateReference());
        t.setStatus(TransactionStatus.SUCCESS);



        switch (t.getTransactionType()) {
            case DEPOSIT: transactionPostingService.cashDeposit(t, cashVault, customerAccount, t.getAmount());
                    break;

        }

        Transaction transaction = transactionRepository.save(t);

        return transactionMapper.toResponse(transaction);
    }
}
