package com.elitetech_inc.ensarkbank.customer_management.card.repository;


import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findByCardNumber(String number);

}
