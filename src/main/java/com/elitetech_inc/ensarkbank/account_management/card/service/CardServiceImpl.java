package com.elitetech_inc.ensarkbank.account_management.card.service;

import com.elitetech_inc.ensarkbank.account_management.card.dto.mapper.CardMapper;
import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
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

    @Override
    public CardResponse createCard(CardRequest cr) {
        Card card = cardMapper.toCard(cr);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public Optional<CardResponse> findCardsByAccountId(Long accountId) {
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
    public Optional<CardResponse> findCardByCustomerId(Long customerId) {
        return cardRepository.findCardByCustomerId(customerId).map(cardMapper::toCardResponse);
    }
}
