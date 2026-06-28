package com.elitetech_inc.ensarkbank.atm.entity;

import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.ATMStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "atms")
@Data
public class ATM extends BaseEntity {


    @Enumerated(EnumType.STRING)
    private ATMStatus status;

    private Double limit;
    private String address;
    private String atmRouting;

    @OneToOne(cascade = CascadeType.ALL)
    @JsonIgnore
    private Account account;

    @ManyToOne
    @JoinColumn(name = "branchID")
    private Branch branch;

    @OneToMany(mappedBy = "atm")
    @JsonIgnore
    private List<ATMTransaction> atmTransections;

}
