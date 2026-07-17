package com.ensark.ensarkbank.customer_management.kyc.dto.request;

import lombok.Data;

@Data
public class KycRequest {
    private Long id;
    private String path;
    private String doc_type;

}
