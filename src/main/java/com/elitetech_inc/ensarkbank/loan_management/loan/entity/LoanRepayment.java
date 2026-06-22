package com.elitetech_inc.ensarkbank.loan_management.loan.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "loan_repayments")
@Data
public class LoanRepayment extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String transactionNo;

    @ManyToOne
    @JoinColumn(name = "loan_account_id", nullable = false)
    @JsonIgnore
    private LoanAccount loanAccount;

    private Double amountPaid;
    
    private Double principalComponent;
    
    private Double interestComponent;

    private LocalDate paymentDate;

    private String paymentMethod; // e.g., CASH, ACCOUNT_TRANSFER

    private String remarks;

}
