package com.ensark.ensarkbank.account_management.cashier_transaction.service;

import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionResponse;

import java.util.List;

public interface CashierTransactionService {
    CashierTransactionResponse createTransaction(CashierTransactionRequest request);
    CashierTransactionResponse getTransactionById(Long id);
    List<CashierTransactionResponse> getAllTransactions();
    List<CashierTransactionResponse> getByAccountNumber(String accountNumber);
    List<CashierTransactionResponse> getByBranchId(Long branchId);
    List<CashierTransactionResponse> getByBranchIds(List<Long> branchIds);
    CashierTransactionResponse updateTransaction(Long id, CashierTransactionRequest request);
    void deleteTransaction(Long id);
}
