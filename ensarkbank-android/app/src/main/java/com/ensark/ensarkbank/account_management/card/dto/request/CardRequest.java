package com.ensark.ensarkbank.account_management.card.dto.request;

import com.ensark.ensarkbank.enums.CardNetwork;
import com.ensark.ensarkbank.enums.CardType;

import lombok.Data;

@Data
public class CardRequest {
    private Long accountId;
    private CardNetwork cardNetwork;
    private CardType cardType;
    private String pin;
    private boolean isInternationalEnabled;
    private boolean isOnlineTransactionEnabled;

}
