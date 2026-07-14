package com.elitetech_inc.ensarkbank.account_management.hold_transaction.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.hold_transaction.entity.HoldTransaction;
import com.elitetech_inc.ensarkbank.common.enums.HoldReason;

import java.math.BigDecimal;
import java.util.List;

public interface HoldTransactionService {

    HoldTransaction createHold(Account account, BigDecimal amount, HoldReason reason, int holdDurationMinutes, String authorizationReference, String merchantInfo);

    HoldTransaction releaseHold(HoldTransaction hold);

    HoldTransaction settleHold(HoldTransaction hold, Long relatedTransactionId);

    List<HoldTransaction> getActiveHoldsByAccount(Long accountId);

    List<HoldTransaction> getActiveCardHoldsByAccount(Long accountId);

    boolean hasActiveCardHolds(Long accountId);

    BigDecimal getActiveHoldBalance(Long accountId);

    void releaseExpiredHolds();

    HoldTransaction getHoldByAuthorizationReference(String authorizationReference);
}
