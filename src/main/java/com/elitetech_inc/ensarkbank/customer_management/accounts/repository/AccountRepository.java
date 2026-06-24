package com.elitetech_inc.ensarkbank.customer_management.accounts.repository;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,Long> {

    Optional<Account> findByAccountNumber(String accNumber);
    boolean existsByAccountNumber(String accNumber);


}
