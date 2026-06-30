package com.elitetech_inc.ensarkbank.customer_management.customer.dto.response;

import com.elitetech_inc.ensarkbank.common.address.address.dto.response.AddressResponse;
import com.elitetech_inc.ensarkbank.common.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.common.enums.AddressType;
import com.elitetech_inc.ensarkbank.common.enums.CustomerOccupation;
import com.elitetech_inc.ensarkbank.common.enums.Gender;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.customer_management.kyc.dto.request.KycRequest;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;


import java.util.Date;
import java.util.List;


@Data
public class CustomerResponse{

    private String email;
    private Role role;
    private boolean isEmailVerified;
    private boolean active;

    private String name;
    private Gender gender;
    private String phone;
    private CustomerOccupation occupation;
    private Date dob;
    private String profile;

    private List<AddressResponse> addresses;

    private List<KycRequest> documents;


}
