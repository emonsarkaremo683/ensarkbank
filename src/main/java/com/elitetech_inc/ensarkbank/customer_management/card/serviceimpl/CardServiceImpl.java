package com.elitetech_inc.ensarkbank.customer_management.card.serviceimpl;

import com.elitetech_inc.ensarkbank.customer_management.card.dto.mapper.CardMapper;
import com.elitetech_inc.ensarkbank.customer_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.customer_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.customer_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.customer_management.card.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;
    private final CardMapper cardMapper;

    @Override
    public CardResponse save(CardRequest cr) {
        Card card = cardMapper.toEntity(cr);
        return cardMapper.toResponse(cardRepository.save(card));
    }

    @Override
    public CardResponse update(Long id, CardRequest cr) {

        Card card = cardMapper.toEntity(cr);
        card.setId(id);
        return cardMapper.toResponse(cardRepository.save(card));
    }

    @Override
    public List<CardResponse> getAll() {
        return cardRepository.findAll()
                .stream()
                .map(cardMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        cardRepository.deleteById(id);
    }

    @Override
    public Optional<CardResponse> findByCardNumber(String number) {
        return cardRepository.findByCardNumber(number)
                .map(cardMapper::toResponse);
    }
}
