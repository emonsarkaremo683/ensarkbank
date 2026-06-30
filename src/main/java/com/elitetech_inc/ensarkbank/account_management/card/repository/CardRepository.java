package com.elitetech_inc.ensarkbank.account_management.card.repository;

import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findByCardNumber(String cardNumber);
    List<Card> findByAccountId(Long accountId);
}
