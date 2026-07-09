package com.elitetech_inc.ensarkbank.account_management.account.repository;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,Long> {
    Optional<Account> findAccountsByBranchId(Long branchId);
    List<Account> findAllByBranchId(Long branchId);
    Optional<Account> findAccountByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);
    boolean existsById(Long id);

    List<Account> findDistinctByHoldersCustomerId(Long customerId);
}
