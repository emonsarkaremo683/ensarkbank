package com.elitetech_inc.ensarkbank.customer_management.transaction.entity;

import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "card_transactions")
@Data
@EqualsAndHashCode(callSuper = true)
public class CardTransaction extends BaseEntity {

    // FIX: removed duplicate @EqualsAndHashCode import that caused compilation error
    // FIX: removed unused ATMTransaction import

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    @JsonIgnore
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    @JsonIgnore
    private Card card;

    // Merchant details snapshot at time of transaction
    private String merchantName;
    private String merchantCategory;
    private String terminalId;
}
