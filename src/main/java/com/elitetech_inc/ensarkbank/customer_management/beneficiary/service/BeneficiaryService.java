package com.elitetech_inc.ensarkbank.customer_management.beneficiary.service;

import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.response.BeneficiaryResponse;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface BeneficiaryService {
    BeneficiaryResponse save(Beneficiary b);
    List<BeneficiaryResponse> getAll();
    Optional<BeneficiaryResponse> findById(Long id);
}
