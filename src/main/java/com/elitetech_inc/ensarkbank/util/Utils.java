package com.elitetech_inc.ensarkbank.util;


import com.elitetech_inc.ensarkbank.atm.repository.ATMTransactionRepository;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class Utils {

//    private final AccountRepository accountRepository;
//    private final TransactionRepository transactionRepository;
//    private final ATMTransactionRepository atmTransactionRepository;
//    private final CardRepository cardRepository;
//
//
//    public String generateReference() {
//        return UUID.randomUUID().toString().replace("-", "").toUpperCase()
//                .substring(0, 8);
//    }
//
//
//    // Deposit Balance
//    public Double getBalance(TransactionRequest t){
//        String accountNumber = t.getAccountNumber();
//        if(t.getType() == TransactionType.ATM_WITHDRAW || t.getType() == TransactionType.ATM_DEPOSIT){
//            accountNumber = cardToAccount(t.getAccountNumber());
//        }
//
//        switch (t.getType()) {
//            case DEPOSIT:
//            case ATM_DEPOSIT:
//            case REFUND:
//                return afterDeposit(accountNumber, t.getAmount());
//            case WITHDRAW:
//            case ATM_WITHDRAW:
//            case PAYMENT:
//                return afterWithdraw(accountNumber, t.getAmount());
//            case TRANSFER:
//                afterWithdraw(t.getSender().getAccountNumber(), t.getAmount());
//                return afterDeposit(accountNumber, t.getAmount());
//            default:
//                return 0.0;
//        }
//    }
//
//    private Double afterDeposit(String account, Double amount){
//        Account acc = getAccount(account);
//        acc.setBalance(acc.getBalance() + amount);
//        return acc.getBalance();
//    }
//
//    private Double afterWithdraw(String account, Double amount){
//        Account acc = getAccount(account);
//        acc.setBalance(acc.getBalance() - amount);
//        return acc.getBalance();
//    }
//
//    public String cardToAccount(String cardNumber){
//        Card c = cardRepository.findByCardNumber(cardNumber).orElseThrow();
//        return c.getAccount().getAccountNumber();
//    }
//
//    private Account getAccount(String account){
//        return accountRepository.findByAccountNumber(account).orElseThrow(
//                ()-> new RuntimeException("Account Not Found")
//        );
//    }


}
