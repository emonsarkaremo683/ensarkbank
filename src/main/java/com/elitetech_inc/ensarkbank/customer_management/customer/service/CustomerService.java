package com.elitetech_inc.ensarkbank.customer_management.customer.service;

import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CustomerService {
    CustomerResponse saveData(CustomerRequest cr,
                              MultipartFile profile,
                              Map<DocumentType, MultipartFile> documents);
    List<CustomerResponse> getAll();
    Optional<CustomerResponse> findById(Long id);

    CustomerResponse changeKycStatus(Long id, KYCStatus status);
    CustomerResponse changeKyc(Long id, Map<DocumentType, MultipartFile> documents);
    CustomerResponse changeCustomerDetails(Long id, CustomerRequest cr,
                                           MultipartFile profile);
    CustomerResponse changeProfilePic(Long id, MultipartFile profile);





}
