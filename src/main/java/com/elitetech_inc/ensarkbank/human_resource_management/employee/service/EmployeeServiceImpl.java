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
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final RequestValidator requestValidator;
    private final PasswordEncoder encoder;

    @Override
    public EmployeeResponse save(EmployeeRequest emp,  MultipartFile profile) {
        requestValidator.validateEmployee(emp);

        Employee employee = employeeMapper.toEmployee(emp);

        // set profile pic
        if (profile != null && !profile.isEmpty()) {
            employee.setProfilePhoto(utils.uploadFile(profile, "employee", emp.getName()));
        }

        // find branch and save
        Branch branch = branchRepository.findById(emp.getBranchId()).orElseThrow(
                ()-> new RuntimeException("Branch not found")
        );
        employee.setBranch(branch);

        // set user and save
        User user = employeeMapper.toUser(emp);
        user.setActive(true);
        user.setEmailVerified(true);
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
    public List<EmployeeResponse> findByBranchId(Long branchId) {
        return employeeRepository.findEmployeeByBranchId(branchId).stream().map(employeeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeResponse update(Long id, EmployeeRequest emp, MultipartFile profile) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        existing.setName(emp.getName());
        existing.setEmail(emp.getEmail());
        existing.setGender(emp.getGender());
        existing.setDesignation(emp.getDesignation());
        existing.setDob(emp.getDob());
        existing.setPhoneNumber(emp.getPhone());

        if (profile != null && !profile.isEmpty()) {
            existing.setProfilePhoto(utils.uploadFile(profile, "employee", emp.getName()));
        }

        Branch branch = branchRepository.findById(emp.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        existing.setBranch(branch);

        User user = existing.getUser();
        user.setEmail(emp.getEmail());
        if (emp.getPassword() != null && !emp.getPassword().isBlank()) {
            user.setPassword(encoder.encode(emp.getPassword()));
        }
        user.setRole(emp.getRole());
        userRepository.save(user);

        return employeeMapper.toResponse(employeeRepository.save(existing));
    }

    @Override
    public EmployeeResponse updateProfilePhoto(Long id, MultipartFile profile) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        if (profile != null && !profile.isEmpty()) {
            existing.setProfilePhoto(utils.uploadFile(profile, "employee", existing.getName()));
        }
        return employeeMapper.toResponse(employeeRepository.save(existing));
    }
}
