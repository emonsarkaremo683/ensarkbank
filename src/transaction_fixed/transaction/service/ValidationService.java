package com.elitetech_inc.ensarkbank.transaction.service;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.customer_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.enums.CardStatus;
import com.elitetech_inc.ensarkbank.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.util.CardGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ValidationService {

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransactionRepository transactionRepository;
    private final CardGenerator cardGenerator;

    /*
     * =====================================================
     * AMOUNT VALIDATION
     * =====================================================
     * FIX: BigDecimal.compareTo — never use == or < on BigDecimal objects
     */
    public void validateAmount(BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero.");
        }
    }

    /*
     * =====================================================
     * ACCOUNT VALIDATION
     * =====================================================
     */
    public Account validateAccount(String accountNumber) {

        return accountRepository.findByAccNumber(accountNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("Account not found: " + accountNumber));
    }

    public boolean accountExists(String accountNumber) {
        return accountRepository.findByAccNumber(accountNumber).isPresent();
    }

    /*
     * =====================================================
     * ACCOUNT STATUS VALIDATION
     * =====================================================
     */
    public void validateAccountStatus(Account account) {

        AccountStatus status = account.getAccountStatus();

        if (status == AccountStatus.ACTIVE) return;

        // FIX: Use a single throw with a descriptive message instead of
        // switch-with-individual-throws — same behaviour, less duplication.
        String reason = switch (status) {
            case INACTIVE -> "inactive";
            case BLOCKED  -> "blocked";
            case CLOSED   -> "closed";
            case FREEZE   -> "frozen";
            case PENDING  -> "pending activation";
            default       -> "not eligible for transactions";
        };

        throw new IllegalStateException(
                "Account [" + account.getAccNumber() + "] is " + reason + ".");
    }

    /*
     * =====================================================
     * BALANCE VALIDATION
     * =====================================================
     * FIX: BigDecimal.compareTo
     */
    public void validateSufficientBalance(Account account, BigDecimal amount) {

        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new IllegalStateException(
                    "Insufficient balance. Available: "
                    + account.getAvailableBalance()
                    + ", Required: " + amount);
        }
    }

    /*
     * =====================================================
     * HOLD BALANCE VALIDATION
     * =====================================================
     */
    public void validateHoldBalance(Account account, BigDecimal amount) {

        if (account.getHoldBalance().compareTo(amount) < 0) {
            throw new IllegalStateException(
                    "Insufficient hold balance to release: " + amount);
        }
    }

    /*
     * =====================================================
     * MINIMUM BALANCE VALIDATION  (new — prevents dormant account overdraft)
     * =====================================================
     */
    public void validateMinimumBalance(Account account, BigDecimal withdrawAmount, BigDecimal minimumBalance) {

        BigDecimal balanceAfterWithdraw = account.getAvailableBalance().subtract(withdrawAmount);
        if (balanceAfterWithdraw.compareTo(minimumBalance) < 0) {
            throw new IllegalStateException(
                    "Transaction would breach the minimum required balance of " + minimumBalance);
        }
    }

    /*
     * =====================================================
     * DEPOSIT VALIDATION
     * =====================================================
     */
    public void validateDeposit(Account account, BigDecimal amount) {
        validateAmount(amount);
        validateAccountStatus(account);
    }

    /*
     * =====================================================
     * WITHDRAW VALIDATION
     * =====================================================
     * FIX: total debit = amount + charge + vat must be checked against available balance
     */
    public void validateWithdraw(Account account, BigDecimal amount) {
        validateAmount(amount);
        validateAccountStatus(account);
        validateSufficientBalance(account, amount);
    }

    public void validateWithdrawWithCharges(
            Account account,
            BigDecimal amount,
            BigDecimal chargeAmount,
            BigDecimal vatAmount
    ) {
        validateAmount(amount);
        validateAccountStatus(account);

        BigDecimal charge = chargeAmount != null ? chargeAmount : BigDecimal.ZERO;
        BigDecimal vat    = vatAmount    != null ? vatAmount    : BigDecimal.ZERO;
        BigDecimal totalDebit = amount.add(charge).add(vat);

        validateSufficientBalance(account, totalDebit);
    }

    /*
     * =====================================================
     * TRANSFER VALIDATION
     * =====================================================
     */
    public void validateTransfer(
            Account sender,
            Account receiver,
            BigDecimal amount
    ) {
        validateAmount(amount);

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "Sender and receiver account cannot be the same.");
        }

        validateAccountStatus(sender);
        validateAccountStatus(receiver);
        validateSufficientBalance(sender, amount);
    }

    public void validateTransferWithCharges(
            Account sender,
            Account receiver,
            BigDecimal amount,
            BigDecimal chargeAmount,
            BigDecimal vatAmount
    ) {
        validateAmount(amount);

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException(
                    "Sender and receiver account cannot be the same.");
        }

        validateAccountStatus(sender);
        validateAccountStatus(receiver);

        BigDecimal charge = chargeAmount != null ? chargeAmount : BigDecimal.ZERO;
        BigDecimal vat    = vatAmount    != null ? vatAmount    : BigDecimal.ZERO;
        validateSufficientBalance(sender, amount.add(charge).add(vat));
    }

    /*
     * =====================================================
     * CARD VALIDATION
     * =====================================================
     */
    public Card validateCard(String cardNumber) {

        Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("CardController not found: " + cardNumber));

        CardStatus status = card.getStatus();

        if (status != CardStatus.ACTIVE) {
            String reason = switch (status) {
                case BLOCKED  -> "blocked";
                case EXPIRED  -> "expired";
                case DISABLED -> "disabled";
                case PENDING  -> "pending activation";
                default       -> "not active";
            };
            throw new IllegalStateException("CardController is " + reason + ".");
        }

        validateCardNumber(card.getCardNumber());

        return card;
    }

    /*
     * =====================================================
     * CARD NUMBER VALIDATION  (Luhn)
     * =====================================================
     */
    public void validateCardNumber(String cardNumber) {

        if (!cardGenerator.isCardValid(cardNumber)) {
            throw new IllegalArgumentException("Invalid card number.");
        }
    }

    /*
     * =====================================================
     * CARD OWNERSHIP VALIDATION
     * =====================================================
     */
    public void validateCardOwnership(Card card, Account account) {

        if (!card.getAccount().getId().equals(account.getId())) {
            throw new IllegalStateException(
                    "CardController does not belong to this account.");
        }
    }

    /*
     * =====================================================
     * TRANSACTION REFERENCE VALIDATION
     * =====================================================
     */
    public void validateReference(String referenceNo) {

        if (transactionRepository.existsByReferenceNo(referenceNo)) {
            throw new IllegalStateException(
                    "Duplicate transaction reference: " + referenceNo);
        }
    }
}
