package com.elitetech_inc.ensarkbank.loan_management.loan.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.enums.InterestType;
import com.elitetech_inc.ensarkbank.enums.LoanStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "loan_accounts")
@Data
public class LoanAccount extends BaseEntity {

    @Column(unique = true)
    private String loanAccountNo;

    @OneToOne
    @JsonIgnore
    private LoanApplication loanApplication;

    private Double principalAmount;
    private Double approvedAmount;
    private Double disbursedAmount;

    private Double interestRate;

    @Enumerated(EnumType.STRING)
    private InterestType interestType;

    private Integer tenureMonths;

    private LocalDate maturityDate;

    private Double outstandingPrincipal;
    private Double outstandingInterest;

    private Double emiAmount;

}
