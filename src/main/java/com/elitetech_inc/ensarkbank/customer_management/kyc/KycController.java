package com.elitetech_inc.ensarkbank.customer_management.kyc;

import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.common.exception.ResourceNotFoundException;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.KycDocuments;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Map;

@RestController
@RequestMapping("/api/kyc/")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @Value("${image.upload.dir}")
    private String uploadDir;

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SERVICE', 'BRANCH_MANAGER')")
    @PatchMapping("customer/{id}/status")
    public ResponseEntity<CustomerResponse> updateKycStatusBYCustomerId(@PathVariable Long id,@RequestBody KYCStatus status) {
        return ResponseEntity.ok(kycService.updateKycStatusBYCustomerId(id, status));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','CASHIER', 'SUPER_ADMIN', 'CUSTOMER_SERVICE', 'BRANCH_MANAGER') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
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

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SERVICE', 'BRANCH_MANAGER') or hasRole('CUSTOMER')")
    @GetMapping("documents/{documentId}")
    public ResponseEntity<Resource> getDocument(@PathVariable Long documentId, Authentication authentication) {
        KycDocuments document = kycService.getDocumentById(documentId);

        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_SUPER_ADMIN")
                        || a.getAuthority().equals("ROLE_CUSTOMER_SERVICE")
                        || a.getAuthority().equals("ROLE_BRANCH_MANAGER"));

        if (!isStaff) {
            boolean isOwner = document.getKyc().getCustomer().getUser() != null
                    && document.getKyc().getCustomer().getUser().getEmail()
                    .equals(authentication.getName());
            if (!isOwner) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have access to this document");
            }
        }

        String storedPath = document.getPath();
        String fileName = storedPath.startsWith("kyc/") ? storedPath.substring(4) : storedPath;
        Path filePath = Paths.get(uploadDir, "kyc", fileName).toAbsolutePath().normalize();

        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("KYC Document file", documentId);
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Could not read file: " + fileName, e);
        }
    }
}
