package com.elitetech_inc.ensarkbank.account_management.card.service;

import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface CardService {

    CardResponse createCard(CardRequest cr);
    Optional<CardResponse> findCardsByAccountId(Long accountId);
    List<CardResponse> getAll();
    Optional<CardResponse> findCardByCustomerId(Long customerId);
}
