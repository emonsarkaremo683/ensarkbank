package com.elitetech_inc.ensarkbank.customer_management.transaction.repository;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    // FIX: added essential query methods missing from original stub

    List<AccountTransaction> findBySender(Account sender);

    Page<AccountTransaction> findBySender(Account sender, Pageable pageable);

    Optional<AccountTransaction> findByTransactionReferenceNo(String referenceNo);

    @Query("""
            SELECT at FROM AccountTransaction at
            WHERE at.sender = :account
            AND at.transaction.createdAt BETWEEN :from AND :to
            ORDER BY at.transaction.createdAt DESC
            """)
    List<AccountTransaction> findByAccountAndDateRange(
            @Param("account") Account account,
            @Param("from")    LocalDateTime from,
            @Param("to")      LocalDateTime to
    );
}
