package com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response;

import com.elitetech_inc.ensarkbank.common.address.address.dto.response.AddressResponse;
import com.elitetech_inc.ensarkbank.common.enums.Designation;
import com.elitetech_inc.ensarkbank.common.enums.Gender;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class EmployeeResponse {
    private String email;
    private String password;
    private Role role;
    private boolean isEmailVerified;
    private boolean active;

    private String name;
    private Gender gender;
    private String phone;
    private Designation designation;
    private Date dob;
    private String profile;

    private List<AddressResponse> addresses;
}
