package com.elitetech_inc.ensarkbank.transaction.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "transactions")
@Data
public class Transaction extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String referenceNo;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    private TransactionChannel channel;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private Double amount;

    private Double chargeAmount;

    private Double vatAmount;

    private String remarks;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL)
    private List<TransactionEntry> transactionEntries = new ArrayList<>();
}