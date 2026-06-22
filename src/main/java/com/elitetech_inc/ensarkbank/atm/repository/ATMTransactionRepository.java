package com.elitetech_inc.ensarkbank.atm.repository;


import com.elitetech_inc.ensarkbank.atm.entity.ATMTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface ATMTransactionRepository extends JpaRepository<ATMTransaction, Long> {
}
