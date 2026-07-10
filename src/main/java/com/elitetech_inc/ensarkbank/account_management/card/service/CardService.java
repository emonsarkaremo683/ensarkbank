package com.elitetech_inc.ensarkbank.account_management.card.service;

import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.common.enums.CardStatus;
import com.elitetech_inc.ensarkbank.common.enums.CardType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface CardService {

    CardResponse createCard(CardRequest cr);
    Optional<CardResponse> findCardByAccountId(Long accountId);
    List<CardResponse> getAll();
    Optional<CardResponse> findCardsByCustomerId(Long customerId);
    CardResponse updateCardStatus(Long cardId, CardStatus cr);
    CardResponse updateCardType(Long cardId, CardType cr);
    CardResponse updateCardPin(Long cardId, String pin);
    CardResponse enableInternationalTransaction(Long cardId, boolean isInternationalEnabled);
}
