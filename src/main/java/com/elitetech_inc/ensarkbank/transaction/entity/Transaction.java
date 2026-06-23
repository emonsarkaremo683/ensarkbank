package com.elitetech_inc.ensarkbank.transaction.entity;

import com.elitetech_inc.ensarkbank.atm.entity.ATMTransaction;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.transaction.AccountTransaction;
import com.elitetech_inc.ensarkbank.customer_management.transaction.CardTransaction;
import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "transactions")
public class Transaction extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String referenceNo;

    private Double amount;

    private String remarks;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn
    private ATMTransaction atmTransaction;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn
    private AccountTransaction accTransaction;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn
    private CardTransaction cardTransaction;

    @OneToMany(mappedBy = "transaction")
    private List<TransactionEntry> transactionEntries = new ArrayList<>();



}
