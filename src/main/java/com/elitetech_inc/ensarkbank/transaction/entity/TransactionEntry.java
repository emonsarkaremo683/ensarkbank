package com.elitetech_inc.ensarkbank.transaction.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.EntryType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "transaction_entries")
public class TransactionEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "account_id")
    private Account account;

    @Enumerated(EnumType.STRING)
    private EntryType  entryType;

    private Double amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

}
