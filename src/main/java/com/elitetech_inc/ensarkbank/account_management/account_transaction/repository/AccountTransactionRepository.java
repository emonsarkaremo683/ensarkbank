package com.elitetech_inc.ensarkbank.account_management.account_transaction.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;

@Repository
public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    @Query("""
        select at from AccountTransaction at
        join at.account ac
        where ac.accountNumber = :accountNumber
""")
    List<AccountTransaction> findByAccountTransactionByAccountNumber(@Param("accountNumber") String accountNumber);

    @Query("""
        select at from AccountTransaction at
        where at.receiverAccountNumber = :accountNumber
""")
    List<AccountTransaction> findByReceiverAccountNumber(@Param("accountNumber") String accountNumber);

    @Query("""
        select at from AccountTransaction at
        join at.account ac
        where ac.id = :accountId
        order by at.createdAt desc
""")
    List<AccountTransaction> findByAccountId(@Param("accountId") Long accountId);
}
