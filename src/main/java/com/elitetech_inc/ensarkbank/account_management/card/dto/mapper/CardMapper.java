package com.elitetech_inc.ensarkbank.account_management.card.dto.mapper;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.account_management.card.entity.CardSecret;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardSecretRepository;
import com.elitetech_inc.ensarkbank.common.enums.AccountType;
import com.elitetech_inc.ensarkbank.common.enums.CardNetwork;
import com.elitetech_inc.ensarkbank.common.enums.CardStatus;
import com.elitetech_inc.ensarkbank.common.enums.HolderType;
import com.elitetech_inc.ensarkbank.util.CardGenerator;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Builder
public class CardMapper {

    private final AccountRepository accountRepository;
    private final CardGenerator cardGenerator;
    private final CardSecretRepository cardSecretRepository;

    public Card toCard(CardRequest cr){

        Account account = accountRepository.findById(cr.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account"+ cr.getAccountId()));


        Card card = new Card();
        card.setAccount(account);
        card.setCardNetwork(cr.getCardNetwork());
        card.setCardType(cr.getCardType());
        card.setStatus(CardStatus.PENDING);
        card.setCardNumber(cardGenerator.cardGenerator(cr.getCardNetwork(), cr.getCardType(), account.getAccountNumber()));
        card.setExpiryDate(Date.from(LocalDate.now().plusYears(5).atStartOfDay(ZoneId.systemDefault()).toInstant()));
        card.setDailyLimit(cr.getDailyLimit());
        card.setMonthlyLimit(cr.getMonthlyLimit());
        card.setInternationalEnabled(false);
        card.setOnlineTransactionEnabled(false);

        return card;
    }

    public CardResponse toCardRequest(Card card){

        CardSecret sc = cardSecretRepository.findByCardId(card.getId()).orElseThrow();

        return CardResponse.builder()
                .cardId(card.getId())
                .cardNumber(card.getCardNumber())
                .cvv(sc.getCvv())
                .cardHolderName(card.getAccount().getHolders()
                        .stream()
                        .filter(h -> h.getHolderType() == HolderType.PRIMARY)
                        .findFirst()
                        .map(h -> h.getCustomer().getName()).orElse("Unknown"))
                .isInternationalEnabled(card.isInternationalEnabled())
                .isOnlineTransactionEnabled(card.isOnlineTransactionEnabled())
                .cardNetwork(card.getCardNetwork())
                .cardType(card.getCardType())
                .status(card.getStatus())
                .expiryDate(card.getExpiryDate())
                .dailyLimit(card.getDailyLimit())
                .monthlyLimit(card.getMonthlyLimit())
                .accountNumber(card.getAccount() != null ? card.getAccount().getAccountNumber() : null)
                .build();
    }
}

