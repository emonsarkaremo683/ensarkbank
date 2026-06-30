package com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.response;

import com.elitetech_inc.ensarkbank.common.enums.BeneficiaryType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class BeneficiaryResponse {
    private String accNumber;
    private String name;
    private String provider;
    private BeneficiaryType beneficiaryType;
    private String CustomerName;
}
