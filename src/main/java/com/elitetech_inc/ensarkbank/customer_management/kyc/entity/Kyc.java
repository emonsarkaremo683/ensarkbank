package com.elitetech_inc.ensarkbank.customer_management.kyc.entity;


import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "kyc")
public class Kyc extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private KYCStatus status;

    @OneToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "kyc", cascade = CascadeType.ALL)
    private List<KycDocuments> documents = new ArrayList<>();

}
