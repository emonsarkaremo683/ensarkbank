package com.elitetech_inc.ensarkbank.atm.dto.request;

import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.smartcardio.Card;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ATMTransactionRequestDTO {

    private ATM atm;
    private Card card;
    private Double amount;
    private Double currentBalance;
    private TransactionType type;
}
