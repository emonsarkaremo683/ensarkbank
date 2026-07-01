package com.elitetech_inc.ensarkbank.customer_management.transaction.dto.mapper;

import com.elitetech_inc.ensarkbank.customer_management.transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.customer_management.transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AccountTransactionMapper {

    public AccountTransactionResponse toAccountTransactionResponse(AccountTransaction at) {

        AccountTransactionResponse response = new AccountTransactionResponse();

        response.setSenderAccountNumber(at.getSender().getAccNumber());
        response.setAccountNumber(at.getAccountNumber());
        response.setName(at.getName());
        response.setBankName(at.getBankName());

        Transaction tx = at.getTransaction();
        response.setReferenceNo(tx.getReferenceNo());
        response.setTransactionType(tx.getTransactionType());
        response.setChannel(tx.getChannel());
        response.setStatus(tx.getStatus());
        response.setAmount(tx.getAmount());
        response.setChargeAmount(tx.getChargeAmount());
        response.setVatAmount(tx.getVatAmount());
        response.setTotalDebitAmount(tx.getTotalDebitAmount());
        response.setRemarks(tx.getRemarks());
        response.setTransactionDate(tx.getCreatedAt());

        return response;
    }

    public Transaction toTransaction(AccountTransactionRequest request) {

        Transaction tx = new Transaction();
        tx.setTransactionType(request.getTransactionType());
        tx.setChannel(request.getChannel());
        tx.setAmount(request.getAmount());

        BigDecimal charge = request.getChargeAmount() != null
                ? request.getChargeAmount() : BigDecimal.ZERO;
        BigDecimal vat = request.getVatAmount() != null
                ? request.getVatAmount() : BigDecimal.ZERO;

        tx.setChargeAmount(charge);
        tx.setVatAmount(vat);
        // FIX: pre-compute totalDebitAmount so the caller just reads it
        tx.setTotalDebitAmount(request.getAmount().add(charge).add(vat));
        tx.setRemarks(request.getRemarks());

        return tx;
    }
}
