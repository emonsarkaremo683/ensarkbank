package com.elitetech_inc.ensarkbank.customer_management.kyc;

import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.common.enums.NotificationType;
import com.elitetech_inc.ensarkbank.common.exception.ResourceNotFoundException;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.mapper.CustomerMapper;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.Kyc;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.KycDocuments;
import com.elitetech_inc.ensarkbank.customer_management.kyc.repository.KycDocumentsRepository;
import com.elitetech_inc.ensarkbank.customer_management.kyc.repository.KycRepository;
import com.elitetech_inc.ensarkbank.util.EmailUtil;
import com.elitetech_inc.ensarkbank.util.NotificationUtil;
import com.elitetech_inc.ensarkbank.util.Utils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Iterator;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KycService {
    private final KycRepository repository;
    private final KycDocumentsRepository documentsRepository;
    private final CustomerRepository customerRepository;
    private final CustomerMapper mapper;
    private final Utils utils;
    private final NotificationUtil notificationUtil;
    private final EmailUtil emailUtil;

    @PersistenceContext
    private EntityManager entityManager;

    public KycDocuments getDocumentById(Long documentId) {
        return documentsRepository.findByIdWithCustomer(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC Document", documentId));
    }

    @Transactional
    public CustomerResponse updateKycStatusBYCustomerId(Long id, KYCStatus status) {

        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Customer", id)
        );

        if (customer.getKyc() == null) {
            throw new ResourceNotFoundException("KYC", "customerId", String.valueOf(id));
        }

        Kyc kyc = repository.findById(customer.getKyc().getId()).orElseThrow(
                () -> new ResourceNotFoundException("KYC", customer.getKyc().getId())
        );

        kyc.setStatus(status);
        Kyc kyc1 = repository.save(kyc);
        customer.setKyc(kyc1);

        CustomerResponse response = mapper.toResponse(customer);

        // Notify customer + email
        if (customer.getUser() != null) {
            NotificationType notifType = status == KYCStatus.VERIFIED
                    ? NotificationType.KYC_VERIFIED : NotificationType.KYC_REJECTED;
            String title = "KYC " + status.name();
            String message = "Your KYC verification has been " + status.name().toLowerCase() + ".";

            notificationUtil.notifyUser(customer.getUser().getId(), notifType, title, message,
                    String.valueOf(id), "KYC");
            emailUtil.sendKycStatusEmail(customer.getUser().getEmail(), customer.getName(), status.name());
        }

        return response;
    }

    @Transactional
    public CustomerResponse updateKyc(Long id, Map<DocumentType, MultipartFile> documents) {
        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Customer", id)
        );

        Kyc kyc = null;
        if(customer.getKyc() == null) {
            kyc = new Kyc();
            kyc.setCustomer(customer);
            kyc.setStatus(KYCStatus.PENDING);
        } else {
            kyc = repository.findById(customer.getKyc().getId()).orElseThrow(
                    ()-> new RuntimeException("not found kyc")
            );
        }

        for (Map.Entry<DocumentType, MultipartFile> entry : documents.entrySet()) {

            DocumentType docType = entry.getKey();
            MultipartFile docFile = entry.getValue();

            if (docFile == null || docFile.isEmpty()) {
                continue;
            }

            Iterator<KycDocuments> iterator = kyc.getDocuments().iterator();

            while (iterator.hasNext()) {
                KycDocuments doc = iterator.next();

                if (doc.getDoc_type() == docType) {

                    String storedPath = doc.getPath();
                    String deleteName = storedPath.startsWith("kyc/") ? storedPath.substring(4) : storedPath;
                    utils.deleteFile("kyc", deleteName);

                    iterator.remove();
                    entityManager.flush();

                    break;
                }
            }

            String filePath = utils.uploadFile(docFile, "kyc", docType.name());

            KycDocuments newDoc = new KycDocuments();
            newDoc.setDoc_type(docType);
            newDoc.setPath("kyc/" + filePath);
            newDoc.setKyc(kyc);

            kyc.getDocuments().add(newDoc);
        }
        Kyc savedKyc = repository.save(kyc);
        customer.setKyc(savedKyc);

        // Notify authorities about KYC document submission/resubmission
        notificationUtil.notifyAuthorities(
                NotificationType.KYC_SUBMITTED,
                "KYC Documents Submitted",
                "Customer " + customer.getName() + " (ID: " + id + ") has submitted KYC documents for review.",
                String.valueOf(id),
                "KYC"
        );

        return mapper.toResponse(customerRepository.save(customer));
    }
}
