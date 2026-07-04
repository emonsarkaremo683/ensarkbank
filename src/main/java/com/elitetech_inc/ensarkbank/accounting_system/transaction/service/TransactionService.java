package com.elitetech_inc.ensarkbank.accounting_system.transaction.service;

import org.springframework.stereotype.Service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;

@Service
public interface TransactionService {

    TransactionResponse createTransaction(TransactionRequest tr, Transaction t,
                                          Account senderAccount,
                                          Account receiverAccount);

    TransactionResponse deposit(TransactionRequest request, Account account);

    TransactionResponse withdraw(TransactionRequest request, Account account);

    TransactionResponse transfer(TransactionRequest request, Account senderAccount, Account receiverAccount);

    TransactionResponse payment(TransactionRequest request, Account senderAccount, Account receiverAccount);

    TransactionResponse refund(TransactionRequest request, Account senderAccount, Account receiverAccount);

    TransactionResponse atmDeposit(TransactionRequest request, Account atmCashAccount, Account customerAccount);

    TransactionResponse atmWithdraw(TransactionRequest request, Account customerAccount, Account atmCashAccount);


    TransactionResponse loanDisbursement(TransactionRequest request, Account loanControlAccount, Account customerAccount);
    TransactionResponse loanRepayment(TransactionRequest request, Account customerAccount, Account loanControlAccount);
}
