package com.elitetech_inc.ensarkbank.account_management.hold_transaction.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.hold_transaction.entity.HoldTransaction;
import com.elitetech_inc.ensarkbank.account_management.hold_transaction.repository.HoldTransactionRepository;
import com.elitetech_inc.ensarkbank.common.enums.HoldReason;
import com.elitetech_inc.ensarkbank.common.enums.HoldStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class HoldTransactionServiceImpl implements HoldTransactionService {

    private final HoldTransactionRepository holdTransactionRepository;
    private final AccountRepository accountRepository;

    @Override
    public HoldTransaction createHold(Account account, BigDecimal amount, HoldReason reason, int holdDurationMinutes, String authorizationReference, String merchantInfo) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hold amount must be positive");
        }

        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient available balance for hold");
        }

        String authRef = authorizationReference;
        if (authRef == null || authRef.isBlank()) {
            authRef = "HOLD-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        }

        HoldTransaction hold = new HoldTransaction();
        hold.setAccount(account);
        hold.setAmount(amount);
        hold.setReason(reason);
        hold.setStatus(HoldStatus.ACTIVE);
        hold.setExpiresAt(LocalDateTime.now().plusMinutes(holdDurationMinutes));
        hold.setAuthorizationReference(authRef);
        hold.setMerchantInfo(merchantInfo);

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setHoldBalance(zeroIfNull(account.getHoldBalance()).add(amount));
        accountRepository.save(account);

        HoldTransaction saved = holdTransactionRepository.save(hold);
        log.info("Hold created: id={}, account={}, amount={}, reason={}, authRef={}", saved.getId(), account.getAccountNumber(), amount, reason, authRef);
        return saved;
    }

    @Override
    public HoldTransaction releaseHold(HoldTransaction hold) {
        if (hold.getStatus() != HoldStatus.ACTIVE) {
            throw new IllegalStateException("Hold is not active, cannot release");
        }

        hold.setStatus(HoldStatus.RELEASED);
        holdTransactionRepository.save(hold);

        Account account = hold.getAccount();
        account.setAvailableBalance(account.getAvailableBalance().add(hold.getAmount()));
        account.setHoldBalance(zeroIfNull(account.getHoldBalance()).subtract(hold.getAmount()));
        accountRepository.save(account);

        log.info("Hold released: id={}, account={}, amount={}, authRef={}", hold.getId(), account.getAccountNumber(), hold.getAmount(), hold.getAuthorizationReference());
        return hold;
    }

    @Override
    public HoldTransaction settleHold(HoldTransaction hold, Long relatedTransactionId) {
        if (hold.getStatus() != HoldStatus.ACTIVE) {
            throw new IllegalStateException("Hold is not active, cannot settle");
        }

        hold.setStatus(HoldStatus.SETTLED);
        hold.setRelatedTransactionId(relatedTransactionId);
        holdTransactionRepository.save(hold);

        Account account = hold.getAccount();
        account.setHoldBalance(zeroIfNull(account.getHoldBalance()).subtract(hold.getAmount()));
        accountRepository.save(account);

        log.info("Hold settled: id={}, account={}, amount={}, txnId={}, authRef={}", hold.getId(), account.getAccountNumber(), hold.getAmount(), relatedTransactionId, hold.getAuthorizationReference());
        return hold;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HoldTransaction> getActiveHoldsByAccount(Long accountId) {
        return holdTransactionRepository.findByAccountIdAndStatus(accountId, HoldStatus.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HoldTransaction> getActiveCardHoldsByAccount(Long accountId) {
        return holdTransactionRepository.findByAccountIdAndStatusAndReason(accountId, HoldStatus.ACTIVE, HoldReason.CARD_AUTH);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveCardHolds(Long accountId) {
        return holdTransactionRepository.hasActiveCardHolds(accountId);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getActiveHoldBalance(Long accountId) {
        return holdTransactionRepository.sumActiveHoldsByAccountId(accountId);
    }

    @Override
    @Scheduled(fixedRate = 60000)
    public void releaseExpiredHolds() {
        List<HoldTransaction> expiredHolds = holdTransactionRepository.findByStatusAndExpiresAtBefore(HoldStatus.ACTIVE, LocalDateTime.now());
        for (HoldTransaction hold : expiredHolds) {
            hold.setStatus(HoldStatus.EXPIRED);
            holdTransactionRepository.save(hold);

            Account account = hold.getAccount();
            account.setAvailableBalance(account.getAvailableBalance().add(hold.getAmount()));
            account.setHoldBalance(zeroIfNull(account.getHoldBalance()).subtract(hold.getAmount()));
            accountRepository.save(account);

            log.info("Hold expired and released: id={}, account={}, amount={}, authRef={}", hold.getId(), account.getAccountNumber(), hold.getAmount(), hold.getAuthorizationReference());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public HoldTransaction getHoldByAuthorizationReference(String authorizationReference) {
        return holdTransactionRepository.findByAuthorizationReferenceAndStatus(authorizationReference, HoldStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Active hold not found for reference: " + authorizationReference));
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
