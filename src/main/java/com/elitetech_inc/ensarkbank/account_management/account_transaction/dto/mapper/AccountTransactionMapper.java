package com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.mapper;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class AccountTransactionMapper {

    private final TransactionMapper transactionMapper;

    public AccountTransactionResponse toResponse(AccountTransaction at) {

        return AccountTransactionResponse.builder()
                .id(at.getId())
                .transactionId(at.getTransaction().getTransactionId())
                .senderAccountNumber(at.getAccount().getAccountNumber())
                .receiverAccountNumber(at.getReceiverAccountNumber())
                .receiverName(at.getReceiverName())
                .bankName(at.getBankName())
                .response(transactionMapper.toResponse(at.getTransaction()))
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
