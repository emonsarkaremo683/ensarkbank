package com.elitetech_inc.ensarkbank.account_management.loan.repository;

import com.elitetech_inc.ensarkbank.account_management.loan.entity.Loan;
import com.elitetech_inc.ensarkbank.common.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByAccountId(Long accountId);
    List<Loan> findByStatus(LoanStatus status);

    @Query("SELECT COUNT(l) > 0 FROM Loan l JOIN l.account a JOIN a.holders h WHERE l.id = :loanId AND h.customer.id = :customerId")
    boolean existsByLoanIdAndCustomerId(@Param("loanId") Long loanId, @Param("customerId") Long customerId);
}
