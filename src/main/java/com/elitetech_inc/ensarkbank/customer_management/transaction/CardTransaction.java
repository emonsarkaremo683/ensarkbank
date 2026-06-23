package com.elitetech_inc.ensarkbank.customer_management.transaction;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "card_transactions")
@Data
public class CardTransaction extends BaseEntity {

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


    @ManyToOne
    @JoinColumn(name = "cardId")
    @JsonIgnore
    private Card card;
}
