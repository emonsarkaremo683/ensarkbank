package com.elitetech_inc.ensarkbank.accounting_system.journal.repository;

import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.JoinHelper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JoinHelperRepository extends JpaRepository<JoinHelper, Long> {
    JoinHelper findJoinHelperByTransaction_Id(Long transaction_id);
}
