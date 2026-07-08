package com.elitetech_inc.ensarkbank.customer_management.customer.service;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.auth_management.user.repository.UserRepository;
import com.elitetech_inc.ensarkbank.common.address.address.dto.request.AddressRequest;
import com.elitetech_inc.ensarkbank.common.address.address.entity.Address;
import com.elitetech_inc.ensarkbank.common.enums.AddressType;
import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.mapper.CustomerMapper;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.Kyc;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.KycDocuments;
import com.elitetech_inc.ensarkbank.customer_management.kyc.repository.KycRepository;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {


    private final CustomerMapper customerMapper;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final KycRepository kycRepository;
    private final Utils utils;
    private final RequestValidator requestValidator;


    @Override
    @Transactional
    public CustomerResponse saveData(CustomerRequest cr,
                                     MultipartFile profile,
                                     Map<DocumentType, MultipartFile> documents) {

        requestValidator.validateCustomer(cr);

        //
        Customer c = customerMapper.toCustomer(cr);

        // Profile image upload (optional)
        if (profile != null && !profile.isEmpty()) {
            c.setProfile(utils.uploadFile(profile, "customer", cr.getName()));
        }

        // Address
        Address present = null;
        Address permanent = null;

        for (AddressRequest a : cr.getAddresses()) {
            if (a.getAddressType() == AddressType.PRESENT) {
                present = customerMapper.toAddress(a);
            } else {
                permanent = customerMapper.toAddress(a);
            }
        }

        User u = customerMapper.toUser(cr);
        if (present != null)   u.getAddresses().add(present);
        if (permanent != null) u.getAddresses().add(permanent);

        // User save
        c.setUser(userRepository.save(u));

        //
        Customer savedCustomer = customerRepository.save(c);

        //
        Kyc kyc = new Kyc();
        kyc.setStatus(KYCStatus.PENDING);
        kyc.setCustomer(savedCustomer);

        //
        if (documents != null && !documents.isEmpty()) {
            for (Map.Entry<DocumentType, MultipartFile> entry : documents.entrySet()) {

                DocumentType docType  = entry.getKey();
                MultipartFile docFile = entry.getValue();

                if (docFile == null || docFile.isEmpty()) continue;

                String filePath = utils.uploadFile(docFile, "kyc", docType.name());

                KycDocuments kycDoc = new KycDocuments();
                kycDoc.setDoc_type(docType);
                kycDoc.setPath(filePath);
                kycDoc.setKyc(kyc);

                kyc.getDocuments().add(kycDoc);
            }
        }

        //
        Kyc savedKyc = kycRepository.save(kyc);
        savedCustomer.setKyc(savedKyc);

        // ── 5. Response ───────────────────────────────────────
        return customerMapper.toResponse(savedCustomer);
    }


    @Override
    public List<CustomerResponse> getAll() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CustomerResponse> findById(Long id) {
        return customerRepository.findById(id).map(customerMapper::toResponse);
    }


}
