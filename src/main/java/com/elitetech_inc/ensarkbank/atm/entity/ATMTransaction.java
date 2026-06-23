package com.elitetech_inc.ensarkbank.atm.entity;


import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "atm_transactions")
@Data

public class ATMTransaction extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    @JsonIgnore
    private Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "atm_id")
    private ATM atm;

    @ManyToOne
    @JoinColumn(name = "card_id")
    @JsonIgnore
    private Card card;
}