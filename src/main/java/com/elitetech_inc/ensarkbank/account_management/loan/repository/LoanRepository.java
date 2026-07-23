package com.elitetech_inc.ensarkbank.account_management.loan.repository;

import com.elitetech_inc.ensarkbank.account_management.loan.entity.Loan;
import com.elitetech_inc.ensarkbank.common.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByAccountId(Long accountId);
    List<Loan> findByStatus(LoanStatus status);

    @Query("SELECT COUNT(l) > 0 FROM Loan l JOIN l.account a JOIN a.holders h WHERE l.id = :loanId AND h.customer.id = :customerId")
    boolean existsByLoanIdAndCustomerId(@Param("loanId") Long loanId, @Param("customerId") Long customerId);

    @Query("SELECT COUNT(l) FROM Loan l JOIN l.account a WHERE a.branch.id IN :branchIds")
    long countByBranchIds(@Param("branchIds") List<Long> branchIds);

    @Query("SELECT COUNT(l) FROM Loan l")
    long countAll();

    @Query("SELECT l.status, COUNT(l) FROM Loan l JOIN l.account a WHERE a.branch.id IN :branchIds GROUP BY l.status")
    List<Object[]> countByStatusGrouped(@Param("branchIds") List<Long> branchIds);

    @Query("SELECT l.status, COUNT(l) FROM Loan l JOIN l.account a GROUP BY l.status")
    List<Object[]> countByStatusGroupedAll();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(l) FROM Loan l JOIN l.account a WHERE a.branch.id IN :branchIds AND l.createdAt BETWEEN :start AND :end")
    long countByBranchIdsAndCreatedAtBetween(@Param("branchIds") List<Long> branchIds, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
