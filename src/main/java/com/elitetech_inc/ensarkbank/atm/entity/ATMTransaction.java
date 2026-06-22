package com.elitetech_inc.ensarkbank.atm.entity;


import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
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

    private Double amount;
    private Double currentBalance;
    @Enumerated(EnumType.STRING)
    private TransactionType type;


    @ManyToOne
    @JoinColumn(name = "atmID")
    @JsonBackReference
    private ATM atm;


    @ManyToOne
    @JoinColumn(name = "cardId")
    @JsonIgnore
    private Card card;
//
//    @ManyToOne(cascade = CascadeType.ALL)
//    @JoinColumn(name = "transaction_id")
//    @JsonIgnore
//    private Transaction transaction;
}
