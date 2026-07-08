package com.elitetech_inc.ensarkbank.accounting_system.journal.repository;

import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JournalRepository extends JpaRepository<Journal, Long> {
    List<Journal> getJournalsByAccountNumber(String accountNumber);
}
