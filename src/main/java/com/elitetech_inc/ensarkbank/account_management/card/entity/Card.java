package com.elitetech_inc.ensarkbank.account_management.card.entity;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.common.enums.CardNetwork;
import com.elitetech_inc.ensarkbank.common.enums.CardStatus;
import com.elitetech_inc.ensarkbank.common.enums.CardType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "cards")
@Data
public class Card extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String cardNumber;

    @Enumerated(EnumType.STRING)
    private CardNetwork cardNetwork;

    @Enumerated(EnumType.STRING)
    private CardType cardType;

    private String pinHash;
    private String cvv;

    @Enumerated(EnumType.STRING)
    private CardStatus status;


    private Date expiryDate;

    private double dailyLimit;
    private double monthlyLimit;
    private double currentDailyUsage;
    private double currentMonthlyUsage;
    private boolean isInternationalEnabled;
    private boolean isOnlineTransactionEnabled;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;
}
