package com.elitetech_inc.ensarkbank.atm.dto.mapper;


import com.elitetech_inc.ensarkbank.atm.dto.request.ATMTransactionRequestDTO;
import com.elitetech_inc.ensarkbank.atm.dto.response.ATMTransactionResponseDTO;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.atm.entity.ATMTransaction;
import org.springframework.stereotype.Component;


@Component
public class ATMTransactionMapper {

    public ATMTransactionResponseDTO toDTO(ATMTransaction transaction) {

        if (transaction == null) return null;

        return new ATMTransactionResponseDTO(
                transaction.getId(),
                transaction.getAtm().getId(),
                transaction.getAmount(),
                transaction.getCurrentBalance(),
                transaction.getType(),
                transaction.getCreatedAt()
        );
    }

    public ATMTransaction toEntity(ATMTransactionRequestDTO dto, ATM atm) {

        if (dto == null) return null;

        ATMTransaction transaction = new ATMTransaction();

        transaction.setAtm(atm);
//        transaction.setCard(dto.getCard());
        transaction.setType(dto.getType());
        transaction.setAmount(dto.getAmount());
        return transaction;
    }
}