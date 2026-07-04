package com.elitetech_inc.ensarkbank.account_management.loan.repository;

import com.elitetech_inc.ensarkbank.account_management.loan.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
    List<LoanRepayment> findByLoanIdOrderByInstallmentNumberAsc(Long loanId);
}