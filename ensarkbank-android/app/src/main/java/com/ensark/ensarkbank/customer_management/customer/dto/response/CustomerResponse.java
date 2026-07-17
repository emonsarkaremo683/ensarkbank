package com.ensark.ensarkbank.customer_management.customer.dto.response;

import com.ensark.ensarkbank.common.address.address.dto.response.AddressResponse;
import com.ensark.ensarkbank.customer_management.kyc.dto.request.KycRequest;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class CustomerResponse{

    private Long id;
    private String email;
    private String role;
    private boolean isEmailVerified;
    private boolean active;

    private String name;
    private String gender;
    private String phone;
    private String occupation;
    private Date dob;
    private String profile;

    private List<AddressResponse> addresses;

    private List<KycRequest> documents;

    private String kycStatus;

}
