package com.ensark.ensarkbank.account_management.account_transaction.dto.request;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private Long otpReferenceId;
    private String otpCode;
}
