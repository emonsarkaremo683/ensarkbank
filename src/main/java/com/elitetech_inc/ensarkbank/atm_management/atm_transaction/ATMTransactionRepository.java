package com.elitetech_inc.ensarkbank.atm_management.atm_transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ATMTransactionRepository extends JpaRepository<ATMTransaction,Long> {
}
