package com.elitetech_inc.ensarkbank.customer_management.customer.dto.mapper;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.common.address.address.dto.request.AddressRequest;
import com.elitetech_inc.ensarkbank.common.address.address.dto.response.AddressResponse;
import com.elitetech_inc.ensarkbank.common.address.address.entity.Address;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.kyc.dto.request.KycRequest;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.KycDocuments;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CustomerMapper {

    //=========================================================
    // Entity -> Response
    //=========================================================

    public CustomerResponse toResponse(Customer customer) {

        CustomerResponse response = new CustomerResponse();

        // User Info
        response.setEmail(customer.getUser().getEmail());
        response.setRole(customer.getUser().getRole());
        response.setEmailVerified(customer.getUser().isEmailVerified());
        response.setActive(customer.getUser().isActive());

        // Customer Info
        response.setName(customer.getName());
        response.setPhone(customer.getPhone());
        response.setOccupation(customer.getOccupation());
        response.setDob(customer.getDob());
        response.setProfile(customer.getProfile());

        // Address List
        List<AddressResponse> addresses = customer.getUser()
                .getAddresses()
                .stream()
                .map(this::toAddressResponse)
                .toList();

        response.setAddresses(addresses);

        // KYC Documents
        List<KycRequest> documents = customer.getKyc()
                .getDocuments()
                .stream()
                .map(this::toKycRequest)
                .toList();

        response.setDocuments(documents);

        return response;
    }

    //=========================================================
    // Request -> Customer
    //=========================================================

    public Customer toCustomer(CustomerRequest request) {

        Customer customer = new Customer();

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setOccupation(request.getOccupation());
        customer.setDob(request.getDob());
        customer.setProfile(request.getProfile());

        return customer;
    }

    //=========================================================
    // Request -> User
    //=========================================================

    public User toUser(CustomerRequest request) {

        User user = new User();

        user.setEmail(request.getEmail());

        // Password Encoding Service Layer এ হবে
        user.setPassword(request.getPassword());

        user.setRole(Role.CUSTOMER);
        user.setEmailVerified(false);
        user.setActive(false);

        return user;
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

        response.setHoldingNo(address.getHoldingNo());
        response.setArea(address.getArea());
        response.setPostalCode(address.getPostalCode());
        response.setAddressType(address.getAddressType());

        if (address.getPoliceStation() != null) {
            response.setPoliceStationName(address.getPoliceStation().getName());
        }

        return response;
    }

    //=========================================================
    // KYC Mapping
    //=========================================================

    public KycDocuments toKycDocument(KycRequest request) {

        KycDocuments document = new KycDocuments();

        document.setPath(request.getPath());
        document.setDoc_type(request.getDoc_type());

        return document;
    }

    private KycRequest toKycRequest(KycDocuments document) {

        KycRequest response = new KycRequest();

        response.setPath(document.getPath());
        response.setDoc_type(document.getDoc_type());

        return response;
    }

}