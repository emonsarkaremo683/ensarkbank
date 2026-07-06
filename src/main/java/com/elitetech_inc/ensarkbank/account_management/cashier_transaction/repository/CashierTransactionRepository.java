package com.elitetech_inc.ensarkbank.account_management.cashier_transaction.repository;

import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.CashierTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CashierTransactionRepository extends JpaRepository<CashierTransaction, Long> {
}
