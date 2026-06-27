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
    private final CardGenerator cardGenerator;


    // Account Validation
    public Account validateAccount(String accountNumber){

        return accountRepository.findByAccNumber(accountNumber)
                .orElseThrow(() ->
                        new RuntimeException("Account not found."));
    }

    public void validateAccountStatus(Account account){

        AccountStatus accountStatus = account.getAccountStatus();

        switch (accountStatus){
            case INACTIVE: throw new RuntimeException("Account is inactive.");
            case BLOCKED: throw new RuntimeException("Account is blocked.");
            case CLOSED: throw new RuntimeException("Account is closed.");
            case FREEZE: throw new RuntimeException("Account is freezed.");
            case PENDING: throw new RuntimeException("Account is pending");
        }

    }

    // Balance Validation
    public void validateSufficientBalance(Account account, double amount){
        if(account.getAvailableBalance() < amount){
            throw new RuntimeException("Insufficient balance.");
        }
    }


    // Transfer Validation
    public void validateTransfer(Account sender, Account receiver, double amount){

        if(sender.getId().equals(receiver.getId())){
            throw new RuntimeException(
                    "Sender and receiver cannot be same.");
        }

        sender = validateAccount(sender.getAccNumber());
        receiver = validateAccount(receiver.getAccNumber());

        validateAccountStatus(sender);

        validateAccountStatus(receiver);

        validateSufficientBalance(sender, amount);
    }

    // Deposit Validation
    public void validateDeposit(Account account){
        validateAccountStatus(account);
    }


    // Withdraw Validation
    public void validateWithdraw(Account account, double amount){
        validateAccountStatus(account);
        validateSufficientBalance(account, amount);
    }


   // Card Validation
    public Card validateCard(String cardNumber){

        Card card = cardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() ->
                        new RuntimeException("Card not found."));

        // Check Status
        CardStatus cardStatus = card.getStatus();
        switch (cardStatus){
            case BLOCKED ->  throw new RuntimeException("Card is blocked.");
            case EXPIRED ->  throw new RuntimeException("Card is expired.");
            case DISABLED -> throw new RuntimeException("Card is disabled.");
            case PENDING ->  throw new RuntimeException("Card is pending");
        }

        validateCardNumber(card.getCardNumber());

        return card;
    }

    // Card number validation

    public void validateCardNumber(String cardNumber){
        if(!cardGenerator.isCardValid(cardNumber))
            throw new RuntimeException("Card is not valid.");
    }

}
