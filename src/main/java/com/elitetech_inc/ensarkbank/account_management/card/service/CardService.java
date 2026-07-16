package com.elitetech_inc.ensarkbank.account_management.card.service;

import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.hold_transaction.entity.HoldTransaction;
import com.elitetech_inc.ensarkbank.common.enums.CardStatus;
import com.elitetech_inc.ensarkbank.common.enums.CardType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CardService {

    CardResponse createCard(CardRequest cr, Long id);
    Optional<CardResponse> findCardByAccountId(Long accountId);
    List<CardResponse> getAll();
    Optional<CardResponse> findCardsByCustomerId(Long customerId);
    CardResponse updateCardStatus(Long cardId, CardStatus cr, double dailyLimit, double monthlyLimit);

    CardResponse updateCardType(Long cardId, CardType cr);
    CardResponse updateCardPin(Long cardId, String newPin, String oldPin);
    CardResponse enableInternationalTransaction(Long cardId, boolean isInternationalEnabled);

    HoldTransaction authorizeCardPurchase(String cardNumber, BigDecimal amount, String merchantInfo, boolean isCashAdvance);

    void settleCardPurchase(String authorizationReference, BigDecimal finalAmount);
}
