package com.elitetech_inc.ensarkbank.customer_management.transaction.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "account_transactions")
@Data
@EqualsAndHashCode(callSuper = true)
public class AccountTransaction extends BaseEntity {

    // FIX: removed duplicate @EqualsAndHashCode import that caused compilation error

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    @JsonIgnore
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    @JsonIgnore
    private Account sender;

    // Receiver details — stored as snapshot at time of transaction
    // (receiver account may change name/bank later)
    private String accountNumber;
    private String name;
    private String bankName;
}
