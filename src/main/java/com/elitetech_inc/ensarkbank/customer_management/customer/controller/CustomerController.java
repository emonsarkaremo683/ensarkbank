package com.elitetech_inc.ensarkbank.customer_management.customer.controller;

import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/api/customer", "/api/v1/customers"})
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CustomerResponse> register(
            @RequestPart("customer") CustomerRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestPart(value = "kycFiles", required = false) List<MultipartFile> kycFiles) {
        
        try {
            return ResponseEntity.ok(customerService.register(request, profileImage, kycFiles));
        } catch (Exception e) {
            throw new RuntimeException("Error processing registration: " + e.getMessage(), e);
        }
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id, 
            @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateCustomerStatus(
            @PathVariable Long id, 
            @RequestParam boolean active) {
        customerService.updateCustomerStatus(id, active);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<CustomerResponse>> searchCustomers(@RequestParam String query) {
        return ResponseEntity.ok(customerService.searchCustomers(query));
    }

    @GetMapping("/profile")
    public ResponseEntity<CustomerResponse> getCustomerProfile(@RequestHeader("X-User-Email") String email) {
        return ResponseEntity.ok(customerService.getCustomerProfile(email));
    }
}
