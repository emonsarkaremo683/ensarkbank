package com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.mapper;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.common.address.address.dto.request.AddressRequest;
import com.elitetech_inc.ensarkbank.common.address.address.dto.response.AddressResponse;
import com.elitetech_inc.ensarkbank.common.address.address.entity.Address;
import com.elitetech_inc.ensarkbank.common.enums.AddressType;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.request.EmployeeRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response.EmployeeResponse;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Transactional
@RequiredArgsConstructor
public class EmployeeMapper {

    private final PasswordEncoder encoder;

    public EmployeeResponse toResponse(Employee emp) {

        List<AddressResponse> addresses = emp.getUser()
                .getAddresses()
                .stream()
                .map(this::toAddressResponse)
                .toList();

        return EmployeeResponse.builder()
                .user_id(emp.getUser().getId())
                .email(emp.getEmail())
                .role(emp.getUser().getRole())
                .isEmailVerified(emp.getUser().isEmailVerified())
                .active(emp.getUser().isActive())
                .id(emp.getId())
                .name(emp.getName())
                .gender(emp.getGender())
                .phone(emp.getPhoneNumber())
                .designation(emp.getDesignation())
                .dob(emp.getDob())
                .profile(emp.getProfilePhoto())
                .branchName(emp.getBranch().getName())
                .branchId(emp.getBranch().getId())
                .addresses(addresses)
                .build();
    }

    public Employee toEmployee(EmployeeRequest request) {
        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setGender(request.getGender());
        employee.setDesignation(request.getDesignation());
        employee.setDob(request.getDob());
        employee.setEmail(request.getEmail());

        employee.setPhoneNumber(request.getPhone());
        return employee;
    }

    public User toUser(EmployeeRequest er) {

        User user = new User();
        user.setEmail(er.getEmail());
        user.setRole(resolveRole(er));
        user.setActive(false);
        user.setPassword(encoder.encode(er.getPassword()));
        user.setEmailVerified(false);

        Address present = null;
        Address permanent = null;

        for (AddressRequest a : er.getAddresses()) {
            if (a.getAddressType() == AddressType.PRESENT) {
                present = this.toAddress(a);
            } else {
                permanent = this.toAddress(a);
            }
        }

        if (present != null)  user.addAddress(present);
        if (permanent != null) user.addAddress(permanent);
        return user;
    }

    //=========================================================
    // Role Resolution
    //=========================================================

    private Role resolveRole(EmployeeRequest er) {

        if (er.getDesignation() == null) {
            throw new IllegalArgumentException("Designation is required");
        }

        Role expectedRole = er.getDesignation().getDefaultRole();
        Role requestedRole = er.getRole();

        // No role sent by client -> just use designation's default
        if (requestedRole == null) {
            return expectedRole;
        }

        // Role sent but doesn't match designation -> reject
        if (requestedRole != expectedRole) {
            throw new IllegalArgumentException(
                    "Role '" + requestedRole + "' is not valid for designation '"
                            + er.getDesignation() + "'. Expected role: '" + expectedRole + "'."
            );
        }

        return requestedRole;
    }

    //=========================================================
    // Address Mapping
    //=========================================================

    public Address toAddress(AddressRequest request) {

        Address address = new Address();

        address.setHoldingNo(request.getHoldingNo());
        address.setArea(request.getArea());
        address.setPostalCode(request.getPostalCode());
        address.setAddressType(request.getAddressType());
        address.setPoliceStation(request.getPoliceStation());

        return address;
    }

    private AddressResponse toAddressResponse(Address address) {

        AddressResponse response = new AddressResponse();

        response.setId(address.getId());
        response.setHoldingNo(address.getHoldingNo());
        response.setArea(address.getArea());
        response.setPostalCode(address.getPostalCode());
        response.setAddressType(address.getAddressType());

        if (address.getPoliceStation() != null) {
            response.setPoliceStationName(address.getPoliceStation().getName());
        }

        return response;
    }
}