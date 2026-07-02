package com.elitetech_inc.ensarkbank.human_resource_management.employee.service;

import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.request.EmployeeRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response.EmployeeResponse;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public interface EmployeeService {

    EmployeeResponse save(EmployeeRequest emp, MultipartFile file);
    List<EmployeeResponse> findAll();
    Optional<EmployeeResponse> findById(Long id);
    Optional<EmployeeResponse> findByBranchId(Long branchId);


}
