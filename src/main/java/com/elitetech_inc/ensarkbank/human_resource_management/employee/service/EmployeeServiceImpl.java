package com.elitetech_inc.ensarkbank.human_resource_management.employee.service;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.auth_management.user.repository.UserRepository;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.mapper.EmployeeMapper;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.request.EmployeeRequest;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.dto.response.EmployeeResponse;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.repository.EmployeeRepository;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final Utils utils;

    @Override
    public EmployeeResponse save(EmployeeRequest emp,  MultipartFile profile) {

        Employee employee = employeeMapper.toEmployee(emp);

        // set profile pic
        if (profile != null && !profile.isEmpty()) {
            employee.setProfilePhoto(utils.uploadFile(profile, "customer", emp.getName()));
        }

        // find branch and save
        Branch branch = branchRepository.findById(emp.getBranchId()).orElseThrow(
                ()-> new RuntimeException("Branch not found")
        );
        employee.setBranch(branch);

        // set user and save
        User user = employeeMapper.toUser(emp);
        employee.setUser(userRepository.save(user));

        return employeeMapper.toResponse(employeeRepository.save(employee));

    }

    @Override
    public List<EmployeeResponse> findAll() {
        return employeeRepository.findAll()
                .stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<EmployeeResponse> findById(Long id) {
        return employeeRepository.findById(id).map(employeeMapper::toResponse);
    }

    @Override
    public Optional<EmployeeResponse> findByBranchId(Long branchId) {
        return employeeRepository.findByBranchId(branchId).map(employeeMapper::toResponse);
    }
}
