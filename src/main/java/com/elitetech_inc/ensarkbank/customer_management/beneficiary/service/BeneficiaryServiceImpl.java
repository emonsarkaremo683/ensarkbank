package com.elitetech_inc.ensarkbank.customer_management.beneficiary.service;

import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.mapper.BeneficiaryMapper;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.response.BeneficiaryResponse;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.repository.BeneficiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService{

    private final BeneficiaryMapper beneficiaryMapper;
    private final BeneficiaryRepository beneficiaryRepository;

    @Override
    public BeneficiaryResponse save(Beneficiary b) {

        return beneficiaryMapper.toResponse(beneficiaryRepository.save(b));
    }

    @Override
    public List<BeneficiaryResponse> getAll() {
        return beneficiaryRepository.findAll()
                .stream()
                .map(beneficiaryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BeneficiaryResponse> findById(Long id) {
        return beneficiaryRepository.findById(id).map(beneficiaryMapper::toResponse);
    }
}
