package com.elitetech_inc.ensarkbank.customer_management.customer.service;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.auth_management.user.repository.UserRepository;
import com.elitetech_inc.ensarkbank.common.address.address.dto.request.AddressRequest;
import com.elitetech_inc.ensarkbank.common.address.address.entity.Address;
import com.elitetech_inc.ensarkbank.common.address.address.repository.AddressRepository;
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
import com.elitetech_inc.ensarkbank.auth_management.auth.security.EmailConfig;
import com.elitetech_inc.ensarkbank.auth_management.auth.security.JwtUtil;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Utils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    private final AddressRepository addressRepository;
    private final EmailConfig emailConfig;
    private final JwtUtil jwtUtil;


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
        User u = customerMapper.toUser(cr);

        for (AddressRequest a : cr.getAddresses()) {
            if (a.getAddressType() == AddressType.PRESENT) {
                present = customerMapper.toAddress(a);


            } else {
                permanent = customerMapper.toAddress(a);

            }
        }


        if (present != null)  u.addAddress(present);
        if (permanent != null) u.addAddress(permanent);

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
                kycDoc.setPath("kyc/" + filePath);
                kycDoc.setKyc(kyc);

                kyc.getDocuments().add(kycDoc);
            }
        }

        //
        Kyc savedKyc = kycRepository.save(kyc);
        savedCustomer.setKyc(savedKyc);

        // ── 5. Send verification email ────────────────────────
        try {
            String token = jwtUtil.generateVerificationToken(u.getEmail());
            emailConfig.sendVerificationEmail(u.getEmail(), cr.getName(), token);
        } catch (MessagingException e) {
            // Log but don't fail — email send should not block registration
            System.err.println("Failed to send verification email: " + e.getMessage());
        }

        // ── 6. Response ───────────────────────────────────────
        return customerMapper.toResponse(savedCustomer);
    }


    @Override
    @Transactional
    public List<CustomerResponse> getAll() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<CustomerResponse> getCustomersByBranchIds(List<Long> branchIds) {
        return customerRepository.findCustomersByBranchIds(branchIds).stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Optional<CustomerResponse> findById(Long id) {
        return customerRepository.findById(id).map(customerMapper::toResponse);
    }

    @Override
    @Transactional
    public CustomerResponse changeKycStatus(Long id, KYCStatus status) {

        Customer c = customerRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Customer with id " + id + " not found")
        );

        c.getKyc().setStatus(status);

        return customerMapper.toResponse(customerRepository.save(c));
    }

    @Override
    @Transactional
    public CustomerResponse changeKyc(Long id, Map<DocumentType, MultipartFile> documents) {
        Customer c = customerRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Customer with id " + id + " not found")
        );

        Kyc kyc = kycRepository.findById(c.getKyc().getId()).orElseThrow(
                ()-> new RuntimeException("Customer with id " + id + " not found")
        );



        kyc.setStatus(KYCStatus.PENDING);
        kyc.getDocuments().clear();

        if (documents != null && !documents.isEmpty()) {
            for (Map.Entry<DocumentType, MultipartFile> entry : documents.entrySet()) {

                DocumentType docType  = entry.getKey();
                MultipartFile docFile = entry.getValue();

                if (docFile == null || docFile.isEmpty()) continue;

                String filePath = utils.uploadFile(docFile, "kyc", docType.name());

                KycDocuments kycDoc = new KycDocuments();
                kycDoc.setDoc_type(docType);
                kycDoc.setPath("kyc/" + filePath);
                kycDoc.setKyc(kyc);

                kyc.getDocuments().add(kycDoc);
            }
        }

        Kyc savedKyc = kycRepository.save(kyc);
        c.setKyc(savedKyc);

        return customerMapper.toResponse(c);
    }

    @Override
    @Transactional
    public CustomerResponse changeCustomerDetails(Long id, CustomerRequest cr, MultipartFile profile) {

        requestValidator.validateCustomer(cr);

        Customer c = customerRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Customer with id " + id + " not found")
        );

        c.setName(cr.getName());
        c.setPhone(cr.getPhone());
        c.setGender(cr.getGender());
        c.setOccupation(cr.getOccupation());
        c.setDob(cr.getDob());

        if (profile != null && !profile.isEmpty()) {
            c.setProfile(utils.uploadFile(profile, "customer", cr.getName()));
        }

        User u = c.getUser();
        u.setEmail(cr.getEmail());

        if (cr.getAddresses() != null) {
            for (AddressRequest a : cr.getAddresses()) {
                if (a.getAddressType() == AddressType.PRESENT) {
                    Address present = customerMapper.toAddress(a);
                    u.getAddresses().add(present);
                } else {
                    Address permanent = customerMapper.toAddress(a);
                    u.getAddresses().add(permanent);
                }
            }
        }

        userRepository.save(u);
        Customer savedCustomer = customerRepository.save(c);

        return customerMapper.toResponse(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerResponse changeProfilePic(Long id, MultipartFile profile) {

        Customer c = customerRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Customer with id " + id + " not found")
        );

        utils.deleteFile("customer",c.getProfile());

        if (profile != null && !profile.isEmpty()) {
            c.setProfile(utils.uploadFile(profile, "customer", c.getName()));
        }

        return customerMapper.toResponse(customerRepository.save(c));
    }

    @Override
    @Transactional
    public List<CustomerResponse> searchCustomers(String query) {
        return customerRepository.searchCustomers(query).stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Optional<CustomerResponse> findByUserEmail(String email) {
        return customerRepository.findByUserEmail(email).map(customerMapper::toResponse);
    }

}
