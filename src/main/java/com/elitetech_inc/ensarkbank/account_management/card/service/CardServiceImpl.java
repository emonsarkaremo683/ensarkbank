package com.elitetech_inc.ensarkbank.account_management.card.service;

import com.elitetech_inc.ensarkbank.account_management.card.dto.mapper.CardMapper;
import com.elitetech_inc.ensarkbank.account_management.card.dto.request.CardRequest;
import com.elitetech_inc.ensarkbank.account_management.card.dto.response.CardResponse;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.account_management.credit_account.entity.CreditAccount;
import com.elitetech_inc.ensarkbank.account_management.credit_account.repository.CreditAccountRepository;
import com.elitetech_inc.ensarkbank.account_management.hold_transaction.entity.HoldTransaction;
import com.elitetech_inc.ensarkbank.account_management.hold_transaction.service.HoldTransactionService;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionPostingService;
import com.elitetech_inc.ensarkbank.common.enums.*;
import com.elitetech_inc.ensarkbank.common.exception.InsufficientCreditException;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Utils;
import com.elitetech_inc.ensarkbank.util.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;
    private final CardMapper cardMapper;
    private final RequestValidator requestValidator;
    private final Validator validator;
    private final PasswordEncoder encoder;
    private final HoldTransactionService holdTransactionService;
    private final TransactionPostingService transactionPostingService;
    private final TransactionMapper transactionMapper;
    private final TransactionRepository transactionRepository;
    private final Utils utils;
    private final CreditAccountRepository creditAccountRepository;

    @Override
    public CardResponse createCard(CardRequest cr, Long id) {
        requestValidator.validateCard(cr);
        validator.checkPassportAvailable(id);
        Card card = cardMapper.toCard(cr);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public Optional<CardResponse> findCardByAccountId(Long accountId) {
        return cardRepository.findByAccountId(accountId)
                .map(cardMapper::toCardResponse);
    }

    @Override
    public List<CardResponse> getAll() {
        return cardRepository.findAll()
                .stream()
                .map(cardMapper::toCardResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CardResponse> findCardsByCustomerId(Long customerId) {
        return cardRepository.findCardByCustomerId(customerId).map(cardMapper::toCardResponse);
    }

    @Override
    public CardResponse updateCardStatus(Long cardId, CardStatus cr, double dailyLimit, double monthlyLimit) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("not found"));
        card.setStatus(cr);
        card.setDailyLimit(card.getCardType() != CardType.DEBIT ? dailyLimit : 0.0);
        card.setMonthlyLimit(card.getCardType() != CardType.DEBIT ? monthlyLimit : 0.0);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public CardResponse updateCardType(Long cardId, CardType cr) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("not found"));
        validator.checkCardStatus(card.getCardNumber());
        card.setCardType(cr);
        card.setStatus(CardStatus.PENDING);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public CardResponse updateCardPin(Long cardId, String newPin, String oldPin) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        if (!encoder.matches(oldPin, card.getPinHash())) {
            throw new IllegalArgumentException("Incorrect old PIN");
        }

        card.setPinHash(encoder.encode(newPin));
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    public CardResponse enableInternationalTransaction(Long cardId, boolean isInternationalEnabled) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("not found"));
        validator.checkCardStatus(card.getCardNumber());
        card.setInternationalEnabled(isInternationalEnabled);
        card.setStatus(CardStatus.PENDING);
        return cardMapper.toCardResponse(cardRepository.save(card));
    }

    @Override
    @Transactional
    public HoldTransaction authorizeCardPurchase(String cardNumber, BigDecimal amount, String merchantInfo, boolean isCashAdvance) {
        Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        if (card.getStatus() != CardStatus.ACTIVE) {
            throw new IllegalStateException("Card is not active, cannot authorize purchase");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Purchase amount must be positive");
        }

        if (card.getCardType() == CardType.CREDIT) {
            return authorizeCreditCardPurchase(card, amount, merchantInfo, isCashAdvance);
        }

        return authorizeDebitCardPurchase(card, amount, merchantInfo);
    }

    private HoldTransaction authorizeDebitCardPurchase(Card card, BigDecimal amount, String merchantInfo) {
        BigDecimal dailyUsage = BigDecimal.valueOf(card.getCurrentDailyUsage());
        BigDecimal dailyLimit = BigDecimal.valueOf(card.getDailyLimit());
        if (dailyLimit.compareTo(BigDecimal.ZERO) > 0 && dailyUsage.add(amount).compareTo(dailyLimit) > 0) {
            throw new IllegalArgumentException("Daily limit exceeded for this card");
        }

        BigDecimal monthlyUsage = BigDecimal.valueOf(card.getCurrentMonthlyUsage());
        BigDecimal monthlyLimit = BigDecimal.valueOf(card.getMonthlyLimit());
        if (monthlyLimit.compareTo(BigDecimal.ZERO) > 0 && monthlyUsage.add(amount).compareTo(monthlyLimit) > 0) {
            throw new IllegalArgumentException("Monthly limit exceeded for this card");
        }

        HoldTransaction hold = holdTransactionService.createHold(
                card.getAccount(),
                amount,
                HoldReason.CARD_AUTH,
                720,
                null,
                merchantInfo
        );

        card.setCurrentDailyUsage(card.getCurrentDailyUsage() + amount.doubleValue());
        card.setCurrentMonthlyUsage(card.getCurrentMonthlyUsage() + amount.doubleValue());
        cardRepository.save(card);

        log.info("Debit card purchase authorized: card={}, amount={}, authRef={}", card.getCardNumber(), amount, hold.getAuthorizationReference());
        return hold;
    }

    private HoldTransaction authorizeCreditCardPurchase(Card card, BigDecimal amount, String merchantInfo, boolean isCashAdvance) {
        CreditAccount creditAccount = creditAccountRepository.findByCardId(card.getId())
                .orElseThrow(() -> new RuntimeException("Credit account not found for this card"));

        if (creditAccount.getStatus() != CreditAccountStatus.ACTIVE) {
            throw new IllegalStateException("Credit account is not active, status: " + creditAccount.getStatus());
        }

        if (isCashAdvance) {
            BigDecimal totalCashAdvanceUsed = creditAccountRepository.findByCardId(card.getId())
                    .map(ca -> {
                        List<HoldTransaction> activeHolds = holdTransactionService.getActiveHoldsByCreditAccount(ca.getId());
                        return activeHolds.stream()
                                .filter(h -> h.getReason() == HoldReason.CARD_AUTH)
                                .map(HoldTransaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                    })
                    .orElse(BigDecimal.ZERO);

            if (totalCashAdvanceUsed.add(amount).compareTo(creditAccount.getCashAdvanceLimit()) > 0) {
                throw new InsufficientCreditException("Cash advance limit exceeded. Available: " + creditAccount.getCashAdvanceLimit().subtract(totalCashAdvanceUsed));
            }
        }

        HoldTransaction hold = holdTransactionService.createHoldOnCredit(
                creditAccount,
                amount,
                HoldReason.CARD_AUTH,
                720,
                null,
                merchantInfo
        );

        log.info("Credit card purchase authorized: card={}, creditAccount={}, amount={}, isCashAdvance={}, authRef={}",
                card.getCardNumber(), creditAccount.getId(), amount, isCashAdvance, hold.getAuthorizationReference());
        return hold;
    }

    @Override
    @Transactional
    public void settleCardPurchase(String authorizationReference, BigDecimal finalAmount) {
        HoldTransaction hold = holdTransactionService.getHoldByAuthorizationReference(authorizationReference);

        if (hold.getReason() != HoldReason.CARD_AUTH) {
            throw new IllegalStateException("Hold is not a card authorization hold");
        }

        if (hold.getCreditAccount() != null) {
            settleCreditCardPurchase(hold, finalAmount);
        } else {
            settleDebitCardPurchase(hold, finalAmount);
        }
    }

    private void settleDebitCardPurchase(HoldTransaction hold, BigDecimal finalAmount) {
        Transaction settlementTransaction = new Transaction();
        settlementTransaction.setTransactionType(TransactionType.CARD_PURCHASE);
        settlementTransaction.setChannel(TransactionChannel.CARD);
        settlementTransaction.setAmount(finalAmount);
        settlementTransaction.setRemarks("Debit card purchase settlement - AuthRef: " + hold.getAuthorizationReference());
        settlementTransaction.setTransactionId(utils.generateReference());
        settlementTransaction.setReferenceNo(utils.generateReference());

        String customerAccountNumber = hold.getAccount().getAccountNumber();
        String merchantSettlementAccount = "br-" + hold.getAccount().getBranch().getRoutingNumber();

        transactionPostingService.settleCardPurchase(
                settlementTransaction,
                customerAccountNumber,
                merchantSettlementAccount,
                hold.getAmount(),
                finalAmount
        );

        holdTransactionService.settleHold(hold, settlementTransaction.getId());
        transactionRepository.save(settlementTransaction);

        log.info("Debit card purchase settled: authRef={}, heldAmount={}, settledAmount={}", hold.getAuthorizationReference(), hold.getAmount(), finalAmount);
    }

    private void settleCreditCardPurchase(HoldTransaction hold, BigDecimal finalAmount) {
        CreditAccount creditAccount = hold.getCreditAccount();

        Transaction settlementTransaction = new Transaction();
        settlementTransaction.setTransactionType(TransactionType.CARD_PURCHASE);
        settlementTransaction.setChannel(TransactionChannel.CARD);
        settlementTransaction.setAmount(finalAmount);
        settlementTransaction.setRemarks("Credit card purchase settlement - AuthRef: " + hold.getAuthorizationReference());
        settlementTransaction.setTransactionId(utils.generateReference());
        settlementTransaction.setReferenceNo(utils.generateReference());
        settlementTransaction.setStatus(TransactionStatus.SUCCESS);

        transactionRepository.save(settlementTransaction);

        holdTransactionService.settleHold(hold, settlementTransaction.getId());

        creditAccount.setOutstandingBalance(creditAccount.getOutstandingBalance().add(finalAmount));
        creditAccountRepository.save(creditAccount);

        log.info("Credit card purchase settled: authRef={}, creditAccount={}, heldAmount={}, settledAmount={}, newOutstanding={}",
                hold.getAuthorizationReference(), creditAccount.getId(), hold.getAmount(), finalAmount, creditAccount.getOutstandingBalance());
    }
}
