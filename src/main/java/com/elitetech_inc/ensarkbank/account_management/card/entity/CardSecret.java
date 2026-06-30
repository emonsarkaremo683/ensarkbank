package com.elitetech_inc.ensarkbank.account_management.card.entity;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "card_secrets")
public class CardSecret extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    private String pinHash;
    private String cvv;
    private int failedAttempts;
    private boolean isBlocked;

    @Temporal(TemporalType.TIMESTAMP)
    private Date lastFailedAttempt;
}
