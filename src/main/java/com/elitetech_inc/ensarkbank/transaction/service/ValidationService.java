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
     */
    public void validateAmount(double amount) {

        if (amount <= 0) {
            throw new RuntimeException(
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
                        new RuntimeException("Account not found."));
    }

    /*
     * =====================================================
     * ACCOUNT STATUS VALIDATION
     * =====================================================
     */
    public void validateAccountStatus(Account account) {

        switch (account.getAccountStatus()) {

            case ACTIVE:
                return;

            case INACTIVE:
                throw new RuntimeException("Account is inactive.");

            case BLOCKED:
                throw new RuntimeException("Account is blocked.");

            case CLOSED:
                throw new RuntimeException("Account is closed.");

            case FREEZE:
                throw new RuntimeException("Account is frozen.");

            case PENDING:
                throw new RuntimeException("Account is pending.");
        }
    }

    /*
     * =====================================================
     * BALANCE VALIDATION
     * =====================================================
     */
    public void validateSufficientBalance(
            Account account,
            double amount
    ) {

        if (account.getAvailableBalance() < amount) {
            throw new RuntimeException("Insufficient balance.");
        }
    }

    /*
     * =====================================================
     * HOLD BALANCE VALIDATION
     * =====================================================
     */
    public void validateHoldBalance(
            Account account,
            double amount
    ) {

        if (account.getHoldBalance() < amount) {
            throw new RuntimeException("Insufficient hold balance.");
        }
    }

    /*
     * =====================================================
     * DEPOSIT VALIDATION
     * =====================================================
     */
    public void validateDeposit(
            Account account,
            double amount
    ) {

        validateAmount(amount);

        validateAccountStatus(account);
    }

    /*
     * =====================================================
     * WITHDRAW VALIDATION
     * =====================================================
     */
    public void validateWithdraw(
            Account account,
            double amount
    ) {

        validateAmount(amount);

        validateAccountStatus(account);

        validateSufficientBalance(account, amount);
    }

    /*
     * =====================================================
     * TRANSFER VALIDATION
     * =====================================================
     */
    public void validateTransfer(
            Account sender,
            Account receiver,
            double amount
    ) {

        validateAmount(amount);

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException(
                    "Sender and receiver account cannot be same.");
        }

        validateAccountStatus(sender);

        validateAccountStatus(receiver);

        validateSufficientBalance(sender, amount);
    }

    /*
     * =====================================================
     * COMMON TRANSACTION VALIDATION
     * =====================================================
     */
    public void validateTransaction(
            Account sender,
            Account receiver,
            double amount
    ) {

        validateAmount(amount);

        validateAccountStatus(sender);

        if (receiver != null) {

            validateAccountStatus(receiver);

            if (sender.getId().equals(receiver.getId())) {

                throw new RuntimeException(
                        "Sender and receiver account cannot be same.");
            }
        }

        validateSufficientBalance(sender, amount);
    }

    /*
     * =====================================================
     * CARD VALIDATION
     * =====================================================
     */
    public Card validateCard(String cardNumber) {

        Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() ->
                        new RuntimeException("Card not found."));

        switch (card.getStatus()) {

            case ACTIVE:
                break;

            case BLOCKED:
                throw new RuntimeException("Card is blocked.");

            case EXPIRED:
                throw new RuntimeException("Card is expired.");

            case DISABLED:
                throw new RuntimeException("Card is disabled.");

            case PENDING:
                throw new RuntimeException("Card is pending.");
        }

        validateCardNumber(card.getCardNumber());

        return card;
    }

    /*
     * =====================================================
     * CARD NUMBER VALIDATION
     * =====================================================
     */
    public void validateCardNumber(String cardNumber) {

        if (!cardGenerator.isCardValid(cardNumber)) {

            throw new RuntimeException("Invalid card number.");
        }
    }

    /*
     * =====================================================
     * CARD OWNERSHIP VALIDATION
     * =====================================================
     */
    public void validateCardOwnership(
            Card card,
            Account account
    ) {

        if (!card.getAccount().getId().equals(account.getId())) {

            throw new RuntimeException(
                    "Card does not belong to this account.");
        }
    }

    /*
     * =====================================================
     * TRANSACTION REFERENCE VALIDATION
     * =====================================================
     */
    public void validateReference(String referenceNo) {

        if (transactionRepository.existsByReferenceNo(referenceNo)) {

            throw new RuntimeException(
                    "Duplicate transaction reference.");
        }
    }

}