package com.elitetech_inc.ensarkbank.human_resource_management.employee.controller;

import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.request.EmployeeRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response.EmployeeResponse;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employee/")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final ObjectMapper objectMapper;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @RequestPart("data") String data,
            @RequestPart(value = "profile", required = false) MultipartFile profilePicture) {

        EmployeeRequest dto = objectMapper.readValue(data, EmployeeRequest.class);

        return new ResponseEntity<>(employeeService.save(dto, profilePicture), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER')")
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployee(){
        return new ResponseEntity<>(employeeService.findAll(), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'ACCOUNTANT', 'LOAN_OFFICER', 'CUSTOMER_SERVICE', 'ATM_MANAGER', 'AUDITOR')")
    @GetMapping("{id}")
    public ResponseEntity<Optional<EmployeeResponse>> getEmployee(@PathVariable Long id){
        return new ResponseEntity<>(employeeService.findById(id), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER')")
    @GetMapping("branch/{branchId}")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployee(@PathVariable Long branchId){
        return new ResponseEntity<>(employeeService.findByBranchId(branchId), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @PutMapping("{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @RequestPart("data") String data,
            @RequestPart(value = "profile", required = false) MultipartFile profilePicture) {

        EmployeeRequest dto = objectMapper.readValue(data, EmployeeRequest.class);

        return new ResponseEntity<>(employeeService.update(id, dto, profilePicture), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CASHIER','ACCOUNTANT', 'LOAN_OFFICER', 'CUSTOMER_SERVICE', 'ATM_MANAGER', 'AUDITOR')")
    @PatchMapping("{id}/updateProfilePicture")
    public ResponseEntity<EmployeeResponse> updateEmployeeProfilePicture(
            @PathVariable Long id,
            @RequestPart(value = "profile", required = true) MultipartFile profilePicture) {

        return new ResponseEntity<>(employeeService.updateProfilePhoto(id, profilePicture), HttpStatus.OK);
    }
}