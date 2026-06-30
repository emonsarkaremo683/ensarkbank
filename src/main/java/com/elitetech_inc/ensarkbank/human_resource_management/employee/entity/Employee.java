package com.elitetech_inc.ensarkbank.human_resource_management.employee.entity;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.common.enums.Designation;
import com.elitetech_inc.ensarkbank.common.enums.Gender;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "employees")
@Data
public class Employee extends BaseEntity {

    private String name;

    @Column(unique = true,  nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Designation designation;

    @Column(unique = true)
    private String phoneNumber;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date dob;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String profilePhoto;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

}
