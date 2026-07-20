package com.elitetech_inc.ensarkbank.account_management.account_holder.entity;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.entity.Signature;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.common.enums.HolderType;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "account_holders")
@Data
public class AccountHolder extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private HolderType holderType;
    private Boolean canWithdraw;
    private Boolean canDeposit;
    private Boolean canApproveTransaction;


    @JsonIgnore
    @ToString.Exclude
    @OneToMany(mappedBy = "accountHolder",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Signature> signatures = new ArrayList<>();

    public void addSignature(Signature sign) {
        sign.setAccountHolder(this);
        this.signatures.add(sign);
    }

    public void addSignatures(List<Signature> sign) {
        sign.forEach(this::addSignature);
    }

    @JsonIgnore
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
