package com.ensark.ensarkbank.common.address.address.dto.request;

import lombok.Data;

@Data
public class AddressRequest {
    private String holdingNo;
    private String area;
    private String postalCode;
    private String addressType;
    private Long policeStationId;
}
