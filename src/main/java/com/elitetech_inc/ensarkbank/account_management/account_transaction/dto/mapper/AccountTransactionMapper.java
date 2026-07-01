package com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.mapper;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;
import org.springframework.stereotype.Component;


@Component
public class AccountTransactionMapper {

    public AccountTransactionResponse toResponse(AccountTransaction at) {

        return AccountTransactionResponse.builder()
                .id(at.getId())
                .transactionId(at.getTransaction().getTransactionId())
                .senderAccountNumber(at.getAccount().getAccountNumber())
                .receiverAccountNumber(at.getReceiverAccountNumber())
                .receiverName(at.getReceiverName())
                .bankName(at.getBankName())
                .amount(at.getTransaction().getAmount())
                .build();
    }

    public AccountTransaction toAccountTransaction(AccountTransactionRequest atr) {

        AccountTransaction at = new AccountTransaction();
        at.setReceiverAccountNumber(atr.getReceiverAccountNumber());
        at.setBankName(atr.getBankName());
        at.setReceiverName(atr.getReceiverName());

        return at;
    }

}
