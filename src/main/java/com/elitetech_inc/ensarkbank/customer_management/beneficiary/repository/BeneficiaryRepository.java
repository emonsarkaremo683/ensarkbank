package com.elitetech_inc.ensarkbank.customer_management.beneficiary.repository;

import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
}
