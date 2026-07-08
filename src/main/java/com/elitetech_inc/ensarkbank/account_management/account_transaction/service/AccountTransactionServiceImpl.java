package com.elitetech_inc.ensarkbank.account_management.account_transaction.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.JoinHelper;
import com.elitetech_inc.ensarkbank.accounting_system.journal.repository.JoinHelperRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.repository.BeneficiaryRepository;
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
    private final BranchRepository branchRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final JoinHelperRepository joinHelperRepository;

    @Override
    @Transactional
    public AccountTransactionResponse save(AccountTransactionRequest atr) {
        if (atr == null || atr.getRequest() == null) {
            throw new IllegalArgumentException("Account transaction request is required");
        }

        Account sender = accountRepository.findById(atr.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));

        Account receiver = null;
        if(atr.getBeneficiaryId() != null){
            Beneficiary bt = beneficiaryRepository.findById(atr.getBeneficiaryId()).orElseThrow(() -> new IllegalArgumentException("Beneficiary not found"));
            if(checkAccountNumber(bt.getAccNumber())){
                receiver = accountRepository.findAccountByAccountNumber(bt.getAccNumber()).orElseThrow(() -> new IllegalArgumentException("Account number not found"));
            }
        }

        if(atr.getReceiverId() != null){
            receiver = accountRepository.findById(atr.getReceiverId()).orElseThrow(() -> new IllegalArgumentException("Receiver account not found"));
        }

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

        transactionService.createTransaction(atr.getRequest(), transaction, sender.getAccountNumber(),
                receiver != null ? receiver.getAccountNumber() : atr.getReceiverAccountNumber()
                );

        AccountTransaction accountTransaction = new AccountTransaction();

        accountTransaction.setAccount(sender);
        accountTransaction.setTransaction(transaction);
        accountTransaction.setReceiverAccountNumber(receiver != null ? receiver.getAccountNumber() : atr.getReceiverAccountNumber());
        accountTransaction.setReceiverName(receiver != null ? receiver.getHolders().getFirst().getCustomer().getName() :  atr.getReceiverName());
        accountTransaction.setBankName(receiver != null ? "Ensark Bank" :atr.getBankName());

        JoinHelper jh = new JoinHelper();
        jh.setAccountTransaction(accountTransaction);
        jh.setTransaction(transaction);
        joinHelperRepository.save(jh);


        return accountTransactionMapper.toResponse(accountTransactionRepository.save(accountTransaction), sender.getAccountNumber());
    }

    @Override
    public Optional<AccountTransactionResponse> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return accountTransactionRepository.findById(id)
                .map(at -> accountTransactionMapper.toResponse(at, at.getAccount().getAccountNumber()));
    }

    @Override
    public Optional<AccountTransactionResponse> findByAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            return Optional.empty();
        }
        return accountTransactionRepository.findByAccountTransactionByAccountNumber(accountNumber)
                .stream()
                .findFirst()
                .map(at -> accountTransactionMapper.toResponse(at, accountNumber));
    }

    @Override
    public List<AccountTransactionResponse> findAllByAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            return List.of();
        }
        List<AccountTransaction> sent = accountTransactionRepository.findByAccountTransactionByAccountNumber(accountNumber);
        List<AccountTransaction> received = accountTransactionRepository.findByReceiverAccountNumber(accountNumber);

        List<AccountTransaction> all = new ArrayList<>();
        all.addAll(sent);
        all.addAll(received);

        return all.stream()
                .map(at -> accountTransactionMapper.toResponse(at, accountNumber))
                .sorted(Comparator.comparing((AccountTransactionResponse r) -> r.getResponse().getReferenceNo()).reversed())
                .toList();
    }

    @Override
    public List<AccountTransactionResponse> findAll() {
        return accountTransactionRepository.findAll()
                .stream()
                .map(at -> accountTransactionMapper.toResponse(at, null))
                .toList();
    }

    @Override
    public List<AccountTransactionResponse> findByAccountId(Long accountId) {
        if (accountId == null) {
            return List.of();
        }
        Account account = accountRepository.findById(accountId).orElse(null);
        String accountNumber = account != null ? account.getAccountNumber() : null;
        return accountTransactionRepository.findByAccountId(accountId)
                .stream()
                .map(at -> accountTransactionMapper.toResponse(at, accountNumber))
                .toList();
    }

    private boolean checkAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            return false;
        }
        return accountRepository.existsByAccountNumber(accountNumber);
    }
}
