package com.elitetech_inc.ensarkbank.account_management.card.service;

import com.elitetech_inc.ensarkbank.account_management.card.dto.mapper.CardMapper;
import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.common.enums.CardStatus;
import com.elitetech_inc.ensarkbank.common.enums.CardType;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService{

    private final CardRepository cardRepository;
    private final CardMapper cardMapper;
    private final RequestValidator requestValidator;
    private final Validator validator;

    @Override
    public CardResponse createCard(CardRequest cr) {
        requestValidator.validateCard(cr);
        Card card = cardMapper.toCard(cr);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public Optional<CardResponse> findCardByAccountId(Long accountId) {
        return cardRepository.findByAccountId(accountId)
                .map(cardMapper::toCardResponse);
    }

    @Override
    public List<CardResponse> getAll() {
        return cardRepository.findAll()
                .stream()
                .map(cardMapper::toCardResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CardResponse> findCardsByCustomerId(Long customerId) {
        return cardRepository.findCardByCustomerId(customerId).map(cardMapper::toCardResponse);
    }

    @Override
    public CardResponse updateCardStatus(Long cardId, CardStatus cr) {
        Card card = cardRepository.findById(cardId).orElseThrow(()-> new RuntimeException("not found"));
        card.setStatus(CardStatus.ACTIVE);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public CardResponse updateCardType(Long cardId, CardType cr) {

        Card card = cardRepository.findById(cardId).orElseThrow(()-> new RuntimeException("not found"));
        validator.checkCardStatus(card.getCardNumber());
        card.setCardType(cr);
        card.setStatus(CardStatus.PENDING);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public CardResponse enableInternationalTransaction(Long cardId, boolean isInternationalEnabled) {
        Card card = cardRepository.findById(cardId).orElseThrow(()-> new RuntimeException("not found"));
        validator.checkCardStatus(card.getCardNumber());
        card.setInternationalEnabled(isInternationalEnabled);
        card.setStatus(CardStatus.PENDING);
        return cardMapper.toCardResponse(cardRepository.save(card));

    }
}
