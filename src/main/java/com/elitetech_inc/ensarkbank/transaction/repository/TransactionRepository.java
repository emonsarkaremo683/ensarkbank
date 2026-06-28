package com.elitetech_inc.ensarkbank.transaction.repository;

import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction,String> {
    boolean existsByReferenceNo(String referenceNo);
}
