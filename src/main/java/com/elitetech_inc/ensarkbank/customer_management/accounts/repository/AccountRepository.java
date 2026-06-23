package com.elitetech_inc.ensarkbank.customer_management.accounts.repository;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account,Long> {

    Account findByAccNumber(String accNumber);
}
