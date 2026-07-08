package com.elitetech_inc.ensarkbank.customer_management.beneficiary.repository;

import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findBeneficiaryByCustomer_id(Long customerId);
}
