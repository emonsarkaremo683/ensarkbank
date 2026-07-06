package com.elitetech_inc.ensarkbank.human_resource_management.employee.controller;

import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.request.EmployeeRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response.EmployeeResponse;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @RequestPart("data") String data,
            @RequestPart(value = "profile", required = false) MultipartFile profilePicture) {

        EmployeeRequest dto = objectMapper.readValue(data, EmployeeRequest.class);

        return new ResponseEntity<>(employeeService.save(dto, profilePicture), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployee(){
        return new ResponseEntity<>(employeeService.findAll(), HttpStatus.OK);
    }

    @GetMapping("{id}")
    public ResponseEntity<Optional<EmployeeResponse>> getEmployee(@PathVariable Long id){
        return new ResponseEntity<>(employeeService.findById(id), HttpStatus.OK);
    }

    @GetMapping("branch/{branchId}")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployee(@PathVariable Long branchId){
        return new ResponseEntity<>(employeeService.findByBranchId(branchId), HttpStatus.OK);
    }

}
