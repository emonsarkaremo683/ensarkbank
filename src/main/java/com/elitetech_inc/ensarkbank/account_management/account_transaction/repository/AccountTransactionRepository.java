package com.elitetech_inc.ensarkbank.account_management.account_transaction.repository;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {
}
