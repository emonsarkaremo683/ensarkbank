package com.elitetech_inc.ensarkbank.customer_management.customer.controller;

import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer/")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final ObjectMapper objectMapper;

    /**
     * POST /api/customer/
     * form-data fields:
     *   - data          (String / JSON)
     *   - profile       (file, optional)
     *   - NID           (file, optional)
     *   - PASSPORT      (file, optional)
     *   - DRIVING_LICENSE (file, optional)
     *   - BIRTH_CERTIFICATE (file, optional)
     */
    @PostMapping
    public CustomerResponse save(
            @RequestPart("data") String data,
            @RequestPart(value = "profile", required = false) MultipartFile profilePicture,

            // KYC document files
            @RequestPart(value = "NID",               required = false) MultipartFile nid,
            @RequestPart(value = "PASSPORT",          required = false) MultipartFile passport,
            @RequestPart(value = "DRIVING_LICENSE",   required = false) MultipartFile drivingLicense,
            @RequestPart(value = "BIRTH_CERTIFICATE", required = false) MultipartFile birthCertificate

    ) throws Exception {

        CustomerRequest dto = objectMapper.readValue(data, CustomerRequest.class);

        Map<DocumentType, MultipartFile> documents = new EnumMap<>(DocumentType.class);

        if (nid != null && !nid.isEmpty()) documents.put(DocumentType.NID, nid);
        if (passport != null && !passport.isEmpty()) documents.put(DocumentType.PASSPORT, passport);
        if (drivingLicense != null && !drivingLicense.isEmpty()) documents.put(DocumentType.DRIVING_LICENSE, drivingLicense);
        if (birthCertificate != null && !birthCertificate.isEmpty()) documents.put(DocumentType.BIRTH_CERTIFICATE, birthCertificate);

        return customerService.saveData(dto, profilePicture, documents);
    }


    @GetMapping
    public List<CustomerResponse> getAll() {
        return customerService.getAll();
    }

    @GetMapping("{id}")
    public Optional<CustomerResponse> findById(@PathVariable Long id) {
        return customerService.findById(id);
    }
}
