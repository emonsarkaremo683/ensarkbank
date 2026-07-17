package com.ensark.ensarkbank.atm_management.atm.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ATMRequest {

    private String status;
    private BigDecimal balance;
    private BigDecimal limit;
    private String address;
    private Long branchId;
}
