package com.elitetech_inc.ensarkbank.customer_management.card.entity;

import com.elitetech_inc.ensarkbank.atm.entity.ATMTransaction;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.CardNetwork;
import com.elitetech_inc.ensarkbank.enums.CardStatus;
import com.elitetech_inc.ensarkbank.enums.CardType;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Entity
@Table(name = "cards")
@Data
public class Card extends BaseEntity {
    private String cardNumber;
    private String cvv;
    private String pin;

    @Enumerated(EnumType.STRING)
    private CardNetwork cardNetwork;

    @Enumerated(EnumType.STRING)
    private CardType type;

    private Boolean isMultipleCurrencyEnable;

    @Enumerated(EnumType.STRING)
    private CardStatus status;

    private Date expiryDate; // 5, 10 years from the issue date

    private Double limit;

    @OneToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "card")
    private List<ATMTransaction> atmTransactions= new ArrayList<>();


}
