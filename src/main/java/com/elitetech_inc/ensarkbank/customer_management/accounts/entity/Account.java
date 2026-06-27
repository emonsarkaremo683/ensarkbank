package com.elitetech_inc.ensarkbank.customer_management.accounts.entity;

import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "accounts")
@Data

public class Account extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String accNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus;

    private Double availableBalance;
    private Double currentBalance;
    private Double holdBalance;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @OneToMany(mappedBy = "account",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<AccountHolder> holders = new ArrayList<>();

}
