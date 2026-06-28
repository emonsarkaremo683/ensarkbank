package com.elitetech_inc.ensarkbank.customer_management.customer.service;

import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public interface CustomerService {
    CustomerResponse register(CustomerRequest request, MultipartFile profileImage, List<MultipartFile> kycFiles);
    
    List<CustomerResponse> getAllCustomers();
    
    CustomerResponse getCustomerById(Long id);
    
    CustomerResponse updateCustomer(Long id, CustomerRequest request);
    
    void updateCustomerStatus(Long id, boolean active);
    
    void deleteCustomer(Long id);
    
    List<CustomerResponse> searchCustomers(String query);
    
    CustomerResponse getCustomerProfile(String email);
}
