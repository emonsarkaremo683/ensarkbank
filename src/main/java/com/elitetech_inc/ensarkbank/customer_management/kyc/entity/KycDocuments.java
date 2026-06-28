package com.elitetech_inc.ensarkbank.customer_management.kyc.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.enums.DocumentType;
import com.elitetech_inc.ensarkbank.enums.NomineeType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "kyc_documents")
@Data
public class KycDocuments extends BaseEntity {

    @Column(nullable = false)
    private String path;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private DocumentType doc_type;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private NomineeType nomineeType;

    @ManyToOne
    @JoinColumn(name = "kyc_id")
    @JsonIgnore
    private Kyc kyc;
}
