package com.elitetech_inc.ensarkbank.customer_management.beneficiary.service;

import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.mapper.BeneficiaryMapper;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.request.BeneficiaryRequest;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.response.BeneficiaryResponse;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.repository.BeneficiaryRepository;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Validator;
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
    private final CustomerRepository customerRepository;
    private final RequestValidator requestValidator;
    private final Validator validator;

    @Override
    public BeneficiaryResponse save(BeneficiaryRequest br) {
        requestValidator.validateBeneficiary(br);

        Beneficiary b = new Beneficiary();
        b.setName(br.getName());
        b.setProvider(br.getProvider());
        b.setBeneficiaryType(br.getBeneficiaryType());
        b.setAccNumber(br.getAccNumber());

        b.setRoutingNumber(br.getRoutingNumber());

        Customer c = customerRepository.findById(br.getCustomerId()).orElseThrow(
                ()-> new RuntimeException("Customer not found")
        );

        b.setCustomer(c);

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

    @Override
    public List<BeneficiaryResponse> findByCustomerId(Long customerId) {
        return beneficiaryRepository.findBeneficiaryByCustomer_id(customerId)
                .stream().map(beneficiaryMapper::toResponse)
                .collect(Collectors.toList());
    }
}
