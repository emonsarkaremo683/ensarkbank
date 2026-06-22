package com.elitetech_inc.ensarkbank.atm.repository;


import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ATMRepository extends JpaRepository<ATM, Long> {
    List<ATM> findByBranchName(String name);
}
