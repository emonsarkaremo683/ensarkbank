package com.elitetech_inc.ensarkbank.account_management.card.repository;

import com.elitetech_inc.ensarkbank.account_management.card.entity.CardSecret;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CardSecretRepository extends JpaRepository<CardSecretRepository, Long> {
    Optional<CardSecret> findByCardId(Long cardId);
}
