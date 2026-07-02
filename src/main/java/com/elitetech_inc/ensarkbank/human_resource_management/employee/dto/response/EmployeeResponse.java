package com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response;

import com.elitetech_inc.ensarkbank.common.address.address.dto.response.AddressResponse;
import com.elitetech_inc.ensarkbank.common.enums.Designation;
import com.elitetech_inc.ensarkbank.common.enums.Gender;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Builder
public class EmployeeResponse {
    private Long user_id;
    private String email;
    private String password;
    private Role role;
    private boolean isEmailVerified;
    private boolean active;

    private Long id;
    private String name;
    private Gender gender;
    private String phone;
    private Designation designation;
    private Date dob;
    private String profile;

    private String branchName;

    private List<AddressResponse> addresses;
}
