package com.elitetech_inc.ensarkbank.account_management.account_transaction.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.mapper.AccountTransactionMapper;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.repository.AccountTransactionRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionService;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountTransactionServiceImpl implements AccountTransactionService {

    private final AccountTransactionRepository accountTransactionRepository;
    private final AccountTransactionMapper accountTransactionMapper;
    private final TransactionService transactionService;
    private final AccountRepository accountRepository;
    private final TransactionMapper transactionMapper;
    private final BranchRepository branchRepository;;

    @Override
    @Transactional
    public AccountTransactionResponse save(AccountTransactionRequest atr) {
        if (atr == null || atr.getRequest() == null) {
            throw new IllegalArgumentException("Account transaction request is required");
        }

        Account sender = accountRepository.findById(atr.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));

        Account receiver = resolveReceiver(atr);

        Transaction transaction = new Transaction();
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setTransactionType(atr.getRequest().getTransactionType() != null
                ? atr.getRequest().getTransactionType()
                : TransactionType.TRANSFER);
        transaction.setChannel(atr.getRequest().getChannel() != null
                ? atr.getRequest().getChannel()
                : TransactionChannel.INTERNET_BANKING);
        transaction.setAmount(atr.getRequest().getAmount());
        transaction.setRemarks(atr.getRequest().getRemarks());
        transaction.setChargeAmount(BigDecimal.ZERO);
        transaction.setVatAmount(BigDecimal.ZERO);

        transactionService.createTransaction(atr.getRequest(), transaction, sender, receiver);

        AccountTransaction accountTransaction = accountTransactionMapper.toAccountTransaction(atr);
        accountTransaction.setAccount(sender);
        accountTransaction.setTransaction(transaction);
        accountTransaction.setReceiverAccountNumber(receiver != null ? receiver.getAccountNumber() : atr.getReceiverAccountNumber());
        accountTransaction.setReceiverName(atr.getReceiverName());
        accountTransaction.setBankName(atr.getBankName());

        return accountTransactionMapper.toResponse(accountTransactionRepository.save(accountTransaction));
    }

    @Override
    public Optional<AccountTransactionResponse> findByAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            return Optional.empty();
        }

        return accountTransactionRepository.findByAccountTransactionByAccountNumber(accountNumber)
                .stream()
                .findFirst()
                .map(accountTransactionMapper::toResponse);
    }

    @Override
    public List<AccountTransactionResponse> findAll() {
        return accountTransactionRepository.findAll()
                .stream()
                .map(accountTransactionMapper::toResponse)
                .toList();
    }

    private Account resolveReceiver(AccountTransactionRequest atr) {
        if (atr.getReceiverAccountNumber() == null || atr.getReceiverAccountNumber().isBlank()) {
            return null;
        }

        if (accountRepository.existsByAccountNumber(atr.getReceiverAccountNumber())) {
            return accountRepository.findAccountByAccountNumber(atr.getReceiverAccountNumber())
                    .orElseThrow(() -> new IllegalArgumentException("Receiver account not found"));
        }

        Account a = accountRepository.findById(atr.getSenderId()).orElseThrow(() -> new IllegalArgumentException("Sender account not found"));

        Branch b = branchRepository.findById(a.getBranch().getId()).orElseThrow(() -> new IllegalArgumentException("Branch not found"));

        return accountRepository.findAccountByAccountNumber("br-" + b.getRoutingNumber())
                .orElseThrow(() -> new IllegalArgumentException("Settlement account not found"));
    }
}
