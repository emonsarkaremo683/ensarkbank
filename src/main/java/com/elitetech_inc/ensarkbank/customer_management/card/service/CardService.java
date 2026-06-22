package com.elitetech_inc.ensarkbank.customer_management.card.service;


import com.elitetech_inc.ensarkbank.customer_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.customer_management.card.dto.response.CardResponse;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public interface CardService {
    CardResponse save(CardRequest cr);
    CardResponse update(Long id, CardRequest cr);
    List<CardResponse> getAll();
    void delete(Long id);
    Optional<CardResponse> findByCardNumber(String number);

}
