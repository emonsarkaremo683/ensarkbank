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
import lombok.NoArgsConstructor;



@Entity
@Table(name = "atmtransactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ATMTransaction extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String referenceNo;

    private Double amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    private TransactionChannel channel =  TransactionChannel.ATM;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;


    private Double chargeAmount;

    private Double vatAmount;

    private String remarks;


    @ManyToOne
    @JoinColumn(name = "atmID")
    @JsonBackReference
    private ATM atm;


    @ManyToOne
    @JoinColumn(name = "cardId")
    @JsonIgnore
    private Card card;




}
