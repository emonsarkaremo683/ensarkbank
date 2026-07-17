package com.ensark.ensarkbank.atm_management.atm.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ATMResponse {

    private Long atmId;
    private String status;
    private BigDecimal limit;
    private String address;
    private String routingNumber;
    private String accNumber;
    private String type;
    private String accountStatus;
    private BigDecimal availableBalance;
    private String branchName;
}
