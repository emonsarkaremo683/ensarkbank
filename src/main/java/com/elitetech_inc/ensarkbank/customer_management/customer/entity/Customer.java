package com.elitetech_inc.ensarkbank.customer_management.customer.entity;

import com.elitetech_inc.ensarkbank.auth_management.user.entity.User;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.common.enums.CustomerOccupation;
import com.elitetech_inc.ensarkbank.customer_management.kyc.entity.Kyc;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "customers")
@Data

public class Customer extends BaseEntity {

    private String name;
    private String phone;

    @Enumerated(EnumType.STRING)
    private CustomerOccupation occupation;

    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private Date dob;

    private String profile;


    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kyc_id")
    private Kyc kyc;




}
