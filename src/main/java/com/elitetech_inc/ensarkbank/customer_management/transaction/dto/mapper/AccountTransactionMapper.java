package com.elitetech_inc.ensarkbank.customer_management.transaction.dto.mapper;

import com.elitetech_inc.ensarkbank.customer_management.transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.customer_management.transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountTransactionMapper {

    AccountTransactionResponse  toAccountTransactionResponse(AccountTransaction at) {
        AccountTransactionResponse atr = new AccountTransactionResponse();
        atr.setSenderAccountNumber(at.getSender().getAccNumber());
        atr.setAccountNumber(at.getAccountNumber());
        atr.setName(at.getName());
        atr.setBankName(at.getBankName());

        atr.setReferenceNo(at.getTransaction().getReferenceNo());
        atr.setTransactionType(at.getTransaction().getTransactionType());
        atr.setChannel(at.getTransaction().getChannel());
        atr.setStatus(at.getTransaction().getStatus());
        atr.setAmount(at.getTransaction().getAmount());
        atr.setChargeAmount(at.getTransaction().getChargeAmount());
        atr.setVatAmount(at.getTransaction().getVatAmount());
        atr.setRemarks(at.getTransaction().getRemarks());

        return atr;
    }


    AccountTransaction toAccountTransaction(AccountTransactionRequest atr) {
        AccountTransaction at = new AccountTransaction();
        at.setAccountNumber(atr.getAccountNumber());
        at.setBankName(atr.getBankName());
        at.setName(atr.getName());
        at.setSender(atr.getSender());

        return at;
    }



}
