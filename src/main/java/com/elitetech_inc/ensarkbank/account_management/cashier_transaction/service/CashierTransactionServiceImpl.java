package com.elitetech_inc.ensarkbank.account_management.cashier_transaction.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.repository.AccountTransactionRepository;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.CashierTransaction;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionMapper;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.repository.CashierTransactionRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionService;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;
import com.elitetech_inc.ensarkbank.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CashierTransactionServiceImpl implements CashierTransactionService {

    private final CashierTransactionRepository cashierTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final BranchRepository branchRepository;
    private final CashierTransactionMapper cashierTransactionMapper;
    private final TransactionMapper transactionMapper;
    private final AccountRepository accountRepository;
    private final TransactionService transactionService;

    @Override
    public CashierTransactionResponse createTransaction(CashierTransactionRequest request) {
        if (request.getTransactionRequest() == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", request.getBranchId()));

        Account branchAcc = accountRepository.findAccountByAccountNumber("br-"+branch.getRoutingNumber())
                .orElseThrow();

        CashierTransaction cashierTransaction = new CashierTransaction();
        cashierTransaction.setCheckNo(request.getCheckNo());
        cashierTransaction.setBranch(branch);
        cashierTransaction.setAccountNumber(request.getAccountNumber());
        cashierTransaction.setAccountName(request.getAccountName());
        cashierTransaction.setBankName(request.getBankName());


        Transaction transaction = transactionMapper.toTransaction(request.getTransactionRequest());
        transaction.setTransactionType(request.getTransactionRequest().getTransactionType());
        transaction.setChannel(TransactionChannel.BRANCH);
        transaction.setStatus(TransactionStatus.SUCCESS);

        if(request.getTransactionRequest().getTransactionType() == TransactionType.DEPOSIT){
            transactionService.createTransaction(
                    request.getTransactionRequest(),
                    transaction,
                    branchAcc.getAccountNumber(),
                    request.getAccountNumber()
            );
        } else{
            transactionService.createTransaction(
                    request.getTransactionRequest(),
                    transaction,
                    branchAcc.getAccountNumber(),
                    request.getAccountNumber()
            );
        }

        cashierTransaction.setTransaction(transaction);

        CashierTransaction saved = cashierTransactionRepository.save(cashierTransaction);
        return cashierTransactionMapper.toResponse(saved);
    }

    @Override
    public CashierTransactionResponse getTransactionById(Long id) {
        CashierTransaction cashierTransaction = cashierTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CashierTransaction", id));
        return cashierTransactionMapper.toResponse(cashierTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashierTransactionResponse> getAllTransactions() {
        return cashierTransactionRepository.findAll()
                .stream()
                .map(cashierTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CashierTransactionResponse updateTransaction(Long id, CashierTransactionRequest request) {
        CashierTransaction existing = cashierTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CashierTransaction", id));

        if (request.getCheckNo() != null) {
            existing.setCheckNo(request.getCheckNo());
        }

        if (request.getTransactionRequest() != null) {
            Transaction updatedTransaction = transactionMapper.toTransaction(request.getTransactionRequest());
            updatedTransaction.setId(existing.getTransaction().getId());
            Transaction savedTransaction = transactionRepository.save(updatedTransaction);
            existing.setTransaction(savedTransaction);
        }


        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", request.getBranchId()));
            existing.setBranch(branch);
        }

        CashierTransaction updated = cashierTransactionRepository.save(existing);
        return cashierTransactionMapper.toResponse(updated);
    }

    @Override
    public void deleteTransaction(Long id) {
        if (!cashierTransactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("CashierTransaction", id);
        }
        cashierTransactionRepository.deleteById(id);
    }

}
