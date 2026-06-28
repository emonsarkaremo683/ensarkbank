package com.elitetech_inc.ensarkbank.loan_management.loan.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.enums.InterestType;
import com.elitetech_inc.ensarkbank.enums.LoanType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "loans_products")
@Data
public class LoanProduct extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private LoanType type;

    private Integer minTenureMonths;
    private Integer maxTenureMonths;

    private Double minAmount;
    private Double maxAmount;

    private Double interestRate;

    @Enumerated(EnumType.STRING)
    private InterestType interestType;

    private Double processingFeeRate;

    private Double latePenaltyRate;

    private Boolean active;

    @OneToMany(mappedBy = "loanProduct")
    private List<LoanApplication> loanApplications = new ArrayList<>();
}
