package com.elitetech_inc.ensarkbank.customer_management.transaction.repository;

import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {
}
