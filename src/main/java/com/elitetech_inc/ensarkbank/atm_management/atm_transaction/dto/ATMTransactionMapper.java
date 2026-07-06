package com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto;

import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.ATMTransaction;
import org.springframework.stereotype.Component;

@Component
public class ATMTransactionMapper {


    public ATMTransactionResponse toResponse(ATMTransaction transaction) {
        return ATMTransactionResponse.builder()
                .ATMTransactionId(transaction.getId())
                .address(transaction.getAtm().getAddress())
                .cardNumber(transaction.getCard().getCardNumber())
                .transactionType(transaction.getTransactionType())
                .build();
    }

    public ATMTransaction toATMTransaction(ATMTransactionRequest att) {
        ATMTransaction transaction = new ATMTransaction();
        transaction.setTransactionType(att.getTransactionType());
        return transaction;
    }
}
