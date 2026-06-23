package com.elitetech_inc.ensarkbank.customer_management.transaction;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "account_transactions")
@Data
public class AccountTransaction extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String referenceNo;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    private TransactionChannel channel;

    private Double amount;

    private Double chargeAmount;

    private Double vatAmount;

    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "sender_id")
    private Account sender;


    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "receiver_id")
    private Account receiver;


}
