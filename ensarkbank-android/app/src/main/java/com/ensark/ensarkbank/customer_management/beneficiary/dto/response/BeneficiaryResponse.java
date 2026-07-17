package com.ensark.ensarkbank.customer_management.beneficiary.dto.response;

import lombok.Data;

@Data
public class BeneficiaryResponse {
    private Long id;
    private String accNumber;
    private String name;
    private String provider;
    private String routingNumber;
    private String beneficiaryType;
    private Long customerId;
    private String customerName;
}
