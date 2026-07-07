package com.elitetech_inc.ensarkbank.accounting_system.transaction.service;

import java.math.BigDecimal;

import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account.service.AccountService;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.branch_management.branch.service.BranchService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;
import com.elitetech_inc.ensarkbank.util.Utils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final Utils utils;
    private final TransactionPostingService transactionPostingService;
    private final BranchService branchService;
    private final AccountRepository accountRepository;
    private final BranchRepository branchRepository;

    @Override
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest tr, Transaction t,
                                                 String sender,
                                                 String receiverAccount) {
        if (tr == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }

        Account senderAccount = accountRepository.findAccountByAccountNumber(sender)
                .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));


        return processTransaction(tr, t, senderAccount, receiverAccount);
    }



    private TransactionResponse processTransaction(TransactionRequest tr, Transaction t,
                                                   Account senderAccount,
                                                   String receiver) {
        if (tr == null || tr.getAmount() == null) {
            throw new IllegalArgumentException("Transaction amount is required");
        }
        if (tr.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }

        Account receiverAccount = resolveReceiver(receiver);


        Transaction transaction = t != null ? t : new Transaction();
        transaction.setAmount(tr.getAmount());
        transaction.setRemarks(tr.getRemarks());
        transaction.setTransactionType(tr.getTransactionType() != null ? tr.getTransactionType() : TransactionType.TRANSFER);
        transaction.setChannel(tr.getChannel() != null ? tr.getChannel() : TransactionChannel.INTERNET_BANKING);
        transaction.setTransactionId(utils.generateReference());
        transaction.setReferenceNo(utils.generateReference());
        transaction.setChargeAmount(transaction.getChargeAmount() == null ? BigDecimal.ZERO : transaction.getChargeAmount());
        transaction.setVatAmount(transaction.getVatAmount() == null ? BigDecimal.ZERO : transaction.getVatAmount());

        try {
            switch (transaction.getTransactionType()) {
                case TRANSFER:
                    if (senderAccount == null) {
                        throw new IllegalArgumentException("Sender accounts are required for transfer");
                    }

                    transactionPostingService.transfer(transaction,
                            senderAccount.getAccountNumber(),
                            receiverAccount != null ? receiverAccount.getAccountNumber() : receiver,
                            transaction.getAmount());
                    break;
                case DEPOSIT:
                    transactionPostingService.cashDeposit(transaction,
                            senderAccount.getAccountNumber(),
                            receiverAccount != null ? receiverAccount.getAccountNumber() : receiver,
                            transaction.getAmount());
                    break;
                case WITHDRAW:
                    transactionPostingService.cashWithdrawal(transaction,
                            receiverAccount != null ? receiverAccount.getAccountNumber() : receiver,
                            senderAccount.getAccountNumber(),
                            transaction.getAmount());
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported transaction type: " + transaction.getTransactionType());
            }

            transaction.setStatus(TransactionStatus.SUCCESS);
        } catch (RuntimeException ex) {
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setRemarks(
                    (transaction.getRemarks() == null ? "" : transaction.getRemarks() + " | ") + ex.getMessage()
            );
            throw ex;
        }

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }


    private Account resolveReceiver(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            return null;
        }

        if (accountRepository.existsByAccountNumber(accountNumber)) {
            return accountRepository.findAccountByAccountNumber(accountNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Receiver account not found"));
        }

        return null;
    }
}
