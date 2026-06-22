package com.elitetech_inc.ensarkbank.atm.entity;

import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.enums.ATMStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;


@Entity
@Table(name = "atms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ATM extends BaseEntity {


    @Enumerated(EnumType.STRING)
    private ATMStatus status;

    private Double currentBalance;
    private Double atmlimit;
    private String address;

    @ManyToOne
    @JoinColumn(name = "branchID")
    private Branch branch;

    @OneToMany(mappedBy = "atm")
    @JsonIgnore
    private List<ATMTransaction> atmTransections;




}
