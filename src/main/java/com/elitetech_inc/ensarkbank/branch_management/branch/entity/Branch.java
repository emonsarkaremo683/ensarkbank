package com.elitetech_inc.ensarkbank.branch_management.branch.entity;

import com.elitetech_inc.ensarkbank.common.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.common.enums.BranchStatus;
import com.elitetech_inc.ensarkbank.common.enums.BranchType;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "branches")
@Data

public class Branch extends BaseEntity {

    private String name;

    private String address;

    private String routingNumber;

    private String branchNumber;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private BranchType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BranchStatus status;


    @ManyToOne
    @JoinColumn(name = "policeStationID")
    private PoliceStation policeStation;

    @OneToMany(mappedBy = "branch")
    @JsonIgnore
    private List<Employee> employees;

//    @OneToMany(mappedBy = "branch",  fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<ATM> atms = new ArrayList<>();
//
//    @OneToMany(mappedBy = "branch",  fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<Account>accounts = new ArrayList<>();


}
