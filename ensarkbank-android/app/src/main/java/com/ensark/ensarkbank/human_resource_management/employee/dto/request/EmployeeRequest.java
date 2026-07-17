package com.ensark.ensarkbank.human_resource_management.employee.dto.request;

import com.ensark.ensarkbank.common.address.address.dto.request.AddressRequest;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class EmployeeRequest {

    private String email;
    private String password;
    private String role;

    private Long branchId;

    private String name;
    private String gender;
    private String phone;
    private String designation;
    private Date dob;
    private String profile;
    private List<AddressRequest> addresses = new ArrayList<>();
}
