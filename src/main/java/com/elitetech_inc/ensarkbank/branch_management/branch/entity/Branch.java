package com.elitetech_inc.ensarkbank.branch_management.branch.entity;

import java.util.ArrayList;
import java.util.List;

import com.elitetech_inc.ensarkbank.common.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.common.enums.BranchStatus;
import com.elitetech_inc.ensarkbank.common.enums.BranchType;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

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

    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Employee> employees = new ArrayList<>();

//    @OneToMany(mappedBy = "branch",  fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<ATM> atms = new ArrayList<>();
//
//    @OneToMany(mappedBy = "branch",  fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<Account>accounts = new ArrayList<>();


}
