package com.elitetech_inc.ensarkbank.account_management.account_transaction.repository;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.TransactionOtp;
import com.elitetech_inc.ensarkbank.common.enums.OtpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionOtpRepository extends JpaRepository<TransactionOtp, Long> {

    Optional<TransactionOtp> findByIdAndStatus(Long id, OtpStatus status);

    @Query("""
        SELECT t FROM TransactionOtp t
        WHERE t.accountNumber = :accountNumber
        AND t.status = 'PENDING'
        AND t.expiresAt > CURRENT_TIMESTAMP
    """)
    Optional<TransactionOtp> findActivePendingOtp(@Param("accountNumber") String accountNumber);

    @Query("""
        SELECT t FROM TransactionOtp t
        WHERE t.status = 'PENDING'
        AND t.expiresAt < CURRENT_TIMESTAMP
    """)
    List<TransactionOtp> findExpiredPendingOtps();
}
