package com.elitetech_inc.ensarkbank.util;


import com.elitetech_inc.ensarkbank.atm.repository.ATMTransactionRepository;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.customer_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.customer_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.CardTransaction;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import com.elitetech_inc.ensarkbank.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.UUID;


@Component
@RequiredArgsConstructor
public class Utils {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ATMTransactionRepository atmTransactionRepository;
    private final CardRepository cardRepository;


    public String generateReference() {
        return UUID.randomUUID().toString().replace("-", "").toUpperCase()
                .substring(0, 8);
    }


    // AccountTransaction Balance
    public void setAccBalance(AccountTransaction at) {

        TransactionType t = at.getTransaction().getTransactionType();

        String sender = at.getSender().getAccNumber();
        String receiver = at.getAccountNumber();

        Double afterChargeAmount = at.getTransaction().getAmount()
                + at.getTransaction().getChargeAmount()
                + at.getTransaction().getVatAmount();

        Double beforeChargeAmount = at.getTransaction().getAmount();

        switch (t) {
            case DEPOSIT:
            case WITHDRAW:
                addBalance(receiver, beforeChargeAmount);
                subBalance(sender, beforeChargeAmount);
                break;

            case TRANSFER:
            case PAYMENT:
                addBalance(receiver, beforeChargeAmount);
                subBalance(sender, afterChargeAmount);
                break;

            case REFUND:
                addBalance(sender, afterChargeAmount);
                subBalance(receiver, beforeChargeAmount);
                break;

            default:
                break;

        }

    }


    // Card Balance
    public void setCardBalance(CardTransaction at) {

        TransactionType t = at.getTransaction().getTransactionType();

        String cardHolder = cardToAccount(at.getCard().getCardNumber());
        String receiver = "";

        Double afterChargeAmount = at.getTransaction().getAmount()
                + at.getTransaction().getChargeAmount()
                + at.getTransaction().getVatAmount();

        Double beforeChargeAmount = at.getTransaction().getAmount();

        switch (t) {
            case DEPOSIT:
            case WITHDRAW:
                addBalance(receiver, beforeChargeAmount);
                subBalance(sender, beforeChargeAmount);
                break;

            case TRANSFER:
            case PAYMENT:
                addBalance(receiver, beforeChargeAmount);
                subBalance(sender, afterChargeAmount);
                break;

            case REFUND:
                addBalance(sender, afterChargeAmount);
                subBalance(receiver, beforeChargeAmount);
                break;

            default:
                break;

        }

    }




    //Adding Balance to Account
    private void addBalance(String accountNumber, Double amount){
        boolean sender = accountRepository.existsByAccountNumber(accountNumber);
        if (sender) {
            Account senderAccount = getAccount(accountNumber);
            senderAccount.setBalance(senderAccount.getBalance() - amount);
            accountRepository.save(senderAccount);
        }
    }

    //Subtract Balance to Account
    private void subBalance(String accountNumber, Double amount){
        boolean receiver = accountRepository.existsByAccountNumber(accountNumber);
        if (receiver) {
            Account receiverAccount = getAccount(accountNumber);
            receiverAccount.setBalance(receiverAccount.getBalance() - amount);
            accountRepository.save(receiverAccount);
        }
    }



    // Finding AccountNumber from Card
    public String cardToAccount(String cardNumber){
        Card c = cardRepository.findByCardNumber(cardNumber).orElseThrow();
        return c.getAccount().getAccNumber();
    }

    // Getting Account information
    private Account getAccount(String account){
        return accountRepository.findByAccountNumber(account).orElseThrow(
                ()-> new RuntimeException("Account Not Found")
        );
    }





}
