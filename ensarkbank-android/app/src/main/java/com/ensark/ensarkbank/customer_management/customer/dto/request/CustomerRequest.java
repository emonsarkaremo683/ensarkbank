package com.ensark.ensarkbank.customer_management.customer.dto.request;

import com.ensark.ensarkbank.common.address.address.dto.request.AddressRequest;
import com.ensark.ensarkbank.customer_management.kyc.dto.request.KycRequest;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class CustomerRequest {

    private String email;
    private String password;

    private String name;
    private String gender;
    private String phone;
    private String occupation;
    private Date dob;
    private String profile;

    private List<AddressRequest> addresses = new ArrayList<>();
    private List<KycRequest> kycRequests;

}
