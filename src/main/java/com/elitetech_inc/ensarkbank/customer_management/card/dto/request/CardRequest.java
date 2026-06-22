package com.elitetech_inc.ensarkbank.customer_management.card.dto.request;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.CardNetwork;
import com.elitetech_inc.ensarkbank.enums.CardStatus;
import com.elitetech_inc.ensarkbank.enums.CardType;
import lombok.Data;

import java.util.Date;

@Data
public class CardRequest {
    private String pin;

    private CardNetwork cardNetwork;

    private Boolean isMultipleCurrencyEnable;

    private CardType type;

    private CardStatus status;

    private Date expiryDate; // 5, 10 years from the issue date

    private Double limit;

    private Account account;
}
