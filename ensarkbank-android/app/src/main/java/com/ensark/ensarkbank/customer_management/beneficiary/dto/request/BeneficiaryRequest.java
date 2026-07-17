package com.ensark.ensarkbank.customer_management.beneficiary.dto.request;

import lombok.Data;

@Data
public class BeneficiaryRequest {
    private String accNumber;
    private String name;
    private String provider;
    private String routingNumber;
    private String beneficiaryType;
    private Long customerId;
}
