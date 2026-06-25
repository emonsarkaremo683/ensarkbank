package com.elitetech_inc.ensarkbank.employee_management.employee.repository;

import com.elitetech_inc.ensarkbank.employee_management.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

}
