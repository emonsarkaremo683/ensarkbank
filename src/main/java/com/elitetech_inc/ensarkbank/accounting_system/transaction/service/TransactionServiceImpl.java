package com.elitetech_inc.ensarkbank.accounting_system.transaction.service;

import java.math.BigDecimal;

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

    @Override
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest tr, Transaction t,
                                                 Account senderAccount,
                                                 Account receiverAccount) {
        if (tr == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        return processTransaction(tr, t, senderAccount, receiverAccount);
    }

    @Override
    @Transactional
    public TransactionResponse deposit(TransactionRequest request, Account account) {
        if (request == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        request.setTransactionType(TransactionType.DEPOSIT);
        return processTransaction(request, null, account, null);
    }

    @Override
    @Transactional
    public TransactionResponse withdraw(TransactionRequest request, Account account) {
        if (request == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        request.setTransactionType(TransactionType.WITHDRAW);
        return processTransaction(request, null, account, null);
    }

    @Override
    @Transactional
    public TransactionResponse transfer(TransactionRequest request, Account senderAccount, Account receiverAccount) {
        if (request == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        request.setTransactionType(TransactionType.TRANSFER);
        return processTransaction(request, null, senderAccount, receiverAccount);
    }

    @Override
    @Transactional
    public TransactionResponse payment(TransactionRequest request, Account senderAccount, Account receiverAccount) {
        if (request == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        request.setTransactionType(TransactionType.PAYMENT);
        return processTransaction(request, null, senderAccount, receiverAccount);
    }

    @Override
    @Transactional
    public TransactionResponse refund(TransactionRequest request, Account senderAccount, Account receiverAccount) {
        if (request == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        request.setTransactionType(TransactionType.REFUND);
        return processTransaction(request, null, senderAccount, receiverAccount);
    }

    @Override
    @Transactional
    public TransactionResponse atmDeposit(TransactionRequest request, Account atmCashAccount, Account customerAccount) {
        if (request == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        request.setTransactionType(TransactionType.ATM_DEPOSIT);
        return processTransaction(request, null, customerAccount, atmCashAccount);
    }

    @Override
    @Transactional
    public TransactionResponse atmWithdraw(TransactionRequest request, Account customerAccount, Account atmCashAccount) {
        if (request == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        request.setTransactionType(TransactionType.ATM_WITHDRAW);
        return processTransaction(request, null, customerAccount, atmCashAccount);
    }

    private TransactionResponse processTransaction(TransactionRequest tr, Transaction t,
                                                   Account senderAccount,
                                                   Account receiverAccount) {
        if (tr == null || tr.getAmount() == null) {
            throw new IllegalArgumentException("Transaction amount is required");
        }
        if (tr.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }

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
                case DEPOSIT:
                    transactionPostingService.credit(transaction, senderAccount, transaction.getAmount());
                    break;
                case WITHDRAW:
                    transactionPostingService.debit(transaction, senderAccount, transaction.getAmount());
                    break;
                case TRANSFER:
                    if (senderAccount == null || receiverAccount == null) {
                        throw new IllegalArgumentException("Sender and receiver accounts are required for transfer");
                    }
                    transactionPostingService.transfer(transaction, senderAccount, receiverAccount, transaction.getAmount());
                    break;
                case PAYMENT:
                    if (senderAccount == null || receiverAccount == null) {
                        throw new IllegalArgumentException("Sender and receiver accounts are required for payment");
                    }
                    transactionPostingService.outwardTransfer(transaction, senderAccount, receiverAccount, transaction.getAmount());
                    break;
                case REFUND:
                    if (senderAccount == null || receiverAccount == null) {
                        throw new IllegalArgumentException("Sender and receiver accounts are required for refund");
                    }
                    transactionPostingService.inwardTransfer(transaction, receiverAccount, senderAccount, transaction.getAmount());
                    break;
                case ATM_DEPOSIT:
                    if (senderAccount == null || receiverAccount == null) {
                        throw new IllegalArgumentException("ATM cash account and customer account are required");
                    }
                    transactionPostingService.atmCashDeposit(transaction, receiverAccount, senderAccount, transaction.getAmount());
                    break;
                case ATM_WITHDRAW:
                    if (senderAccount == null || receiverAccount == null) {
                        throw new IllegalArgumentException("Customer account and ATM cash account are required");
                    }
                    transactionPostingService.atmWithdrawal(transaction, senderAccount, receiverAccount, transaction.getAmount());
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
}
