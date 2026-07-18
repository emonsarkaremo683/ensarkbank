package com.ensark.ensarkbank.account_management.card.dto.response;

import com.ensark.ensarkbank.enums.CardNetwork;
import com.ensark.ensarkbank.enums.CardStatus;
import com.ensark.ensarkbank.enums.CardType;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class CardResponse {
    private Long cardId;
    private String cardNumber;
    private String cardHolderName;
    private CardNetwork cardNetwork;
    private CardType cardType;
    private CardStatus status;
    private Date expiryDate;
    private double dailyLimit;
    private double monthlyLimit;
    private String accountNumber;
    private boolean isInternationalEnabled;
    private boolean isOnlineTransactionEnabled;
    private Date createdAt;
}
