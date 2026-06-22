package com.elitetech_inc.ensarkbank.customer_management.card.dto.mapper;


import com.elitetech_inc.ensarkbank.customer_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.customer_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.util.CardGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CardMapper {

    @Autowired
    private CardGenerator cardGenerator;

    public CardResponse toResponse(Card card) {
        if (card == null) {
            return null;
        }

        CardResponse cr = new CardResponse();
        cr.setCardNumber(card.getCardNumber());
        cr.setCvv(card.getCvv());
        cr.setCardNetwork(card.getCardNetwork());
        cr.setType(card.getType());
        cr.setStatus(card.getStatus());
        cr.setExpiryDate(card.getExpiryDate());
        cr.setLimit(card.getLimit());
        cr.setIssueDate(card.getCreatedAt());

        if (card.getAccount() != null) {
            cr.setAccountNumber(card.getAccount().getAccNumber());
            if (card.getAccount().getHolders() != null && !card.getAccount().getHolders().isEmpty()) {
                cr.setHolderName(card.getAccount().getHolders().getFirst().getCustomer().getName());
            }
        }

        return cr;
    }

    public Card toEntity(CardRequest request) {
        if (request == null) {
            return null;
        }

        Card card = new Card();
        card.setPin(request.getPin());
        card.setCardNetwork(request.getCardNetwork());
        card.setType(request.getType());
        card.setStatus(request.getStatus());
        card.setExpiryDate(request.getExpiryDate());
        card.setLimit(request.getLimit());
        card.setAccount(request.getAccount());

        // Generate card number and cvv
        card.setCardNumber(cardGenerator.cardGenerator(request));
        card.setCvv(cardGenerator.getCvv());

        return card;
    }
}
