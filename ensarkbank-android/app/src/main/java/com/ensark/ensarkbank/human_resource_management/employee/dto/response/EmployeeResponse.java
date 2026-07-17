package com.ensark.ensarkbank.human_resource_management.employee.dto.response;

import com.ensark.ensarkbank.common.address.address.dto.response.AddressResponse;
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
    private String role;
    private boolean isEmailVerified;
    private boolean active;

    private Long id;
    private String name;
    private String gender;
    private String phone;
    private String designation;
    private Date dob;
    private String profile;

    private String branchName;
    private Long branchId;

    private List<AddressResponse> addresses;
}
