package com.elitetech_inc.ensarkbank.accounting_system.journal.repository;

import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface JournalRepository extends JpaRepository<Journal, Long> {
    List<Journal> getJournalsByAccountNumber(String accountNumber);

    @Query("select j from Journal j where j.account.branch.id = :branchId")
    List<Journal> findByBranchId(@Param("branchId") Long branchId);

    @Query("select j from Journal j where j.account.branch.id = :branchId " +
            "and j.createdAt >= :from and j.createdAt <= :to")
    List<Journal> findByBranchIdAndDateRange(@Param("branchId") Long branchId,
                                             @Param("from") LocalDateTime from,
                                             @Param("to") LocalDateTime to);

    @Query("select j from Journal j where j.createdAt >= :from and j.createdAt <= :to")
    List<Journal> findByDateRange(@Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to);

    @Query("""
    SELECT j
    FROM Journal j
    WHERE j.accountNumber IN :accountNumbers
      AND j.createdAt BETWEEN :startDate AND :endDate
    ORDER BY j.createdAt DESC
    """)
    List<Journal> findTransactionHistory(
            @Param("accountNumbers") List<String> accountNumbers,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
