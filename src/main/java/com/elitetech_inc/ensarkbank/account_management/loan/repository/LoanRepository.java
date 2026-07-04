package com.elitetech_inc.ensarkbank.account_management.loan.repository;

import com.elitetech_inc.ensarkbank.account_management.loan.entity.Loan;
import com.elitetech_inc.ensarkbank.common.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByAccountId(Long accountId);
    List<Loan> findByStatus(LoanStatus status);
}
