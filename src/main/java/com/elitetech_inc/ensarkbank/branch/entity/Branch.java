package com.elitetech_inc.ensarkbank.branch.entity;



import com.elitetech_inc.ensarkbank.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.employee.entity.Employee;
import com.elitetech_inc.ensarkbank.enums.BranchStatus;
import com.elitetech_inc.ensarkbank.enums.BranchType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    private Double cash_vault;


    @ManyToOne
    @JoinColumn(name = "policeStationID")
    private PoliceStation policeStation;


    @OneToMany(mappedBy = "branch")
    @JsonIgnore
    private List<Employee> employees;

    @OneToMany(mappedBy = "branch",  fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ATM> atms = new ArrayList<>();
//
//    @OneToMany(mappedBy = "branch",  fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<Account>accounts = new ArrayList<>();


}
