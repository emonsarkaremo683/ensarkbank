package com.elitetech_inc.ensarkbank.employee.entity;

import com.elitetech_inc.ensarkbank.auth.user.entity.User;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.enums.Designation;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "employees")
@Data
public class Employee extends BaseEntity {
    private String name;

    @Column(unique = true, nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Designation designation;

    @DateTimeFormat(pattern = "MM/dd/yyyy")
    private Date dob;

    private String profile_pic;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @OneToMany(mappedBy = "employee")
    private List<EmployeeDocument> employeeDocuments = new ArrayList<>();
}
