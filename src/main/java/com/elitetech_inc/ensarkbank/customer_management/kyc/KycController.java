package com.elitetech_inc.ensarkbank.customer_management.kyc;

import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumMap;
import java.util.Map;

@RestController
@RequestMapping("/api/kyc/")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SERVICE', 'BRANCH_MANAGER')")
    @PatchMapping("customer/{id}/status")
    public ResponseEntity<CustomerResponse> updateKycStatusBYCustomerId(@PathVariable Long id,@RequestBody KYCStatus status) {
        return ResponseEntity.ok(kycService.updateKycStatusBYCustomerId(id, status));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','CASHIER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE', 'BRANCH_MANAGER', 'CUSTOMER')")
    @PatchMapping("customer/{id}/upload")
    public ResponseEntity<CustomerResponse> updateKycUploadBYCustomerId(@PathVariable Long id,@RequestPart(value = "NID", required = false) MultipartFile nid,
                                                                        @RequestPart(value = "PASSPORT",          required = false) MultipartFile passport,
                                                                        @RequestPart(value = "DRIVING_LICENSE",   required = false) MultipartFile drivingLicense,
                                                                        @RequestPart(value = "BIRTH_CERTIFICATE", required = false) MultipartFile birthCertificate
    ) {
        Map<DocumentType, MultipartFile> documents = new EnumMap<>(DocumentType.class);

        if (nid != null && !nid.isEmpty()) documents.put(DocumentType.NID, nid);
        if (passport != null && !passport.isEmpty()) documents.put(DocumentType.PASSPORT, passport);
        if (drivingLicense != null && !drivingLicense.isEmpty()) documents.put(DocumentType.DRIVING_LICENSE, drivingLicense);
        if (birthCertificate != null && !birthCertificate.isEmpty()) documents.put(DocumentType.BIRTH_CERTIFICATE, birthCertificate);

        return ResponseEntity.ok(kycService.updateKyc(id, documents));

    }
}
