package com.elitetech_inc.ensarkbank.account_management.card.repository;

import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findByCardNumber(String cardNumber);
    Optional<Card> findByAccountId(Long accountId);
    boolean existsCardByCardNumber(String cardNumber);
    @Query("""
    SELECT DISTINCT c
    FROM Card c
    JOIN c.account a
    JOIN a.holders h
    WHERE h.customer.id = :customerId
""")
    Optional<Card> findCardByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(c) > 0 FROM Card c JOIN c.account a JOIN a.holders h WHERE c.id = :cardId AND h.customer.id = :customerId")
    boolean existsByCardIdAndCustomerId(@Param("cardId") Long cardId, @Param("customerId") Long customerId);
}
