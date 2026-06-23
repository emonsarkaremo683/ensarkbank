package com.elitetech_inc.ensarkbank.customer_management.customer.entity;

import com.elitetech_inc.ensarkbank.auth.user.entity.User;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import com.elitetech_inc.ensarkbank.loan_management.loan.entity.LoanApplication;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
public class Customer extends BaseEntity {

    private String name;

    @Column(unique = true, nullable = false)
    private String phone;

    private String occupation;

    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private Date dob;

    private String profile_pic;


    @OneToOne
    @JsonIgnore
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "customer")
    private List<AccountHolder> accountHolders = new ArrayList<>();

    @OneToMany(mappedBy = "customer")
    private List<LoanApplication> loanApplications = new ArrayList<>();

    @OneToMany(mappedBy = "customer")
    private List<Beneficiary> beneficiaries = new ArrayList<>();


}
