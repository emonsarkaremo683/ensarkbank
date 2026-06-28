package com.elitetech_inc.ensarkbank.loan_management.loan.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.enums.LoanStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "loan_application")
@Data
public class LoanApplication extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String applicationNo;

    @Column(nullable = false)
    private Double requestedAmount;

    @Column(nullable = false)
    private Integer requestedTenureMonths;


    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    private String remarks;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "loan_id")
    private LoanProduct loanProduct;

    @OneToOne
    @JsonIgnore
    private LoanAccount loanAccount;
}
