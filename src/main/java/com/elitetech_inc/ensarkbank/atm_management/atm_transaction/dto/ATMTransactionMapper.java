package com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto;

import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.ATMTransaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ATMTransactionMapper {

    private final TransactionMapper transactionMapper;

    public ATMTransactionResponse toResponse(ATMTransaction transaction) {
        return ATMTransactionResponse.builder()
                .ATMTransactionId(transaction.getId())
                .address(transaction.getAtm().getAddress())
                .cardNumber(transaction.getCard().getCardNumber())
                .transactionType(transaction.getTransactionType())
                .transactionResponse(transaction.getTransaction() != null
                        ? transactionMapper.toResponse(transaction.getTransaction())
                        : null)
                .build();
    }

    public ATMTransaction toATMTransaction(ATMTransactionRequest att) {
        ATMTransaction transaction = new ATMTransaction();
        transaction.setTransactionType(att.getTransactionType());
        return transaction;
    }
}
