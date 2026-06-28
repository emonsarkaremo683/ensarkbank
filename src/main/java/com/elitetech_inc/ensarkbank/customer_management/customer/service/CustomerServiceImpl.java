package com.elitetech_inc.ensarkbank.customer_management.customer.service;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.auth_management.user.repository.UserRepository;
import com.elitetech_inc.ensarkbank.common.address.address.dto.request.AddressRequest;
import com.elitetech_inc.ensarkbank.common.address.address.entity.Address;
import com.elitetech_inc.ensarkbank.common.address.policestation.repository.PoliceStationRepository;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.mapper.CustomerMapper;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import com.elitetech_inc.ensarkbank.customer_management.kyc.dto.request.KycRequest;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.Kyc;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.KycDocuments;
import com.elitetech_inc.ensarkbank.common.file.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final PoliceStationRepository policeStationRepository;
    private final FileStorageService fileStorageService;

    private final CustomerMapper customerMapper;

    @Override
    public CustomerResponse register(CustomerRequest request, MultipartFile profileImage, List<MultipartFile> kycFiles) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }
        Customer customer = customerMapper.toCustomer(request);
        
        if (profileImage != null && !profileImage.isEmpty()) {
            String profileImagePath = fileStorageService.storeFile(profileImage);
            customer.setProfile(profileImagePath);
        }


        User user = customerMapper.toUser(request);
        customer.setUser(user);

        for (AddressRequest ar : request.getAddresses()) {

            Address address = customerMapper.toAddress(ar);

            /*

            PoliceStation ps = policeStationRepository
                    .findById(ar.getPoliceStationId())
                    .orElseThrow(() ->
                        new RuntimeException("Police Station not found"));
            address.setPoliceStation(ps);
            */

            address.setUser(user);

            user.getAddresses().add(address);
        }


        Kyc kyc = new Kyc();

        kyc.setCustomer(customer);
        customer.setKyc(kyc);

        for (int i = 0; i < request.getKycRequests().size(); i++) {
            KycRequest kr = request.getKycRequests().get(i);
            KycDocuments document = customerMapper.toKycDocument(kr);

            if (kycFiles != null && kycFiles.size() > i) {
                MultipartFile kycFile = kycFiles.get(i);
                if (kycFile != null && !kycFile.isEmpty()) {
                    String path = fileStorageService.storeFile(kycFile);
                    document.setPath(path);
                }
            }

            document.setKyc(kyc);

            kyc.getDocuments().add(document);
        }

        Customer savedCustomer =
                customerRepository.save(customer);

        return customerMapper.toResponse(savedCustomer);
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toResponse)
                .toList();
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
        return customerMapper.toResponse(customer);
    }

    @Override
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
        
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setOccupation(request.getOccupation());
        customer.setDob(request.getDob());
        
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toResponse(savedCustomer);
    }

    @Override
    public void updateCustomerStatus(Long id, boolean active) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
        User user = customer.getUser();
        if (user != null) {
            user.setActive(active);
            userRepository.save(user);
        }
    }

    @Override
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    @Override
    public List<CustomerResponse> searchCustomers(String query) {
        return customerRepository.searchCustomers(query).stream()
                .map(customerMapper::toResponse)
                .toList();
    }

    @Override
    public CustomerResponse getCustomerProfile(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found for email " + email));
        return customerMapper.toResponse(customer);
    }
}
