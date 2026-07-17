package com.ensark.ensarkbank.common.address.address.dto.response;

import lombok.Data;

@Data
public class AddressResponse {

    private Long id;
    private String holdingNo;
    private String area;
    private String postalCode;
    private String addressType;
    private String policeStationName;
}
