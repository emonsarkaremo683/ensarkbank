package com.elitetech_inc.ensarkbank.atm_management.atm_transaction;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionService;
import com.elitetech_inc.ensarkbank.atm_management.atm.ATM;
import com.elitetech_inc.ensarkbank.atm_management.atm.ATMRepository;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionMapper;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionRequest;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ATMTransactionServiceImpl implements ATMTransactionService {

    private final ATMTransactionRepository atmTransactionRepository;
    private final ATMTransactionMapper  atmTransactionMapper;
    private final CardRepository  cardRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final ATMRepository atmRepository;
    private final TransactionService transactionService;
    private final AccountRepository accountRepository;

    @Override
    public ATMTransactionResponse transaction(ATMTransactionRequest request) {

        ATMTransaction att = atmTransactionMapper.toATMTransaction(request);

        ATM atm = atmRepository.findById(request.getAtmId()).orElseThrow(
                ()-> new RuntimeException("ATM Not Found")
        );

        att.setAtm(atm);

        Card card = cardRepository.findById(request.getCardId()).orElseThrow(
                (()-> new RuntimeException("Card Not Found"))
        );
        att.setCard(card);

        Transaction t = transactionMapper.toTransaction(request.getTransactionRequest());

        Account sender = null;
        Account receiver = null;

        switch (request.getTransactionType()){
            case CASH_WITHDRAW:
              sender = accountRepository.findAccountByAccountNumber(card.getAccount().getAccountNumber()).orElseThrow();
              receiver = accountRepository.findAccountByAccountNumber(atm.getAccount().getAccountNumber()).orElseThrow();
                transactionService.createTransaction(
                        request.getTransactionRequest(),
                        t,
                        sender,
                        receiver.getAccountNumber());
              break;
            case CASH_DEPOSIT:
                receiver = accountRepository.findAccountByAccountNumber(card.getAccount().getAccountNumber()).orElseThrow();
                transactionService.deposit(request.getTransactionRequest(), receiver);
                break;
            default:
                throw new RuntimeException("Invalid Transaction Type");

        }

        att.setTransaction(t);

        return atmTransactionMapper.toResponse(atmTransactionRepository.save(att));
    }

    @Override
    public ATMTransactionResponse refill(Long atmId, BigDecimal amount) {
        return null;
    }

    private Account sender(ATMTransactionRequest request){

        switch (request.getTransactionType()){
            case CASH_WITHDRAW:
                Card card = cardRepository.findById(request.getCardId()).orElseThrow();
                return accountRepository.findAccountByAccountNumber(card.getAccount().getAccountNumber()).orElseThrow();
        }
        return null;
    }

    private Account receiver(ATMTransactionRequest request){
        ATM atm = atmRepository.findById(request.getAtmId()).orElseThrow();
        switch (request.getTransactionType()){
            case CASH_WITHDRAW:
                return accountRepository.findAccountByAccountNumber(atm.getAccount().getAccountNumber()).orElseThrow();


        }
        return null;
    }
}
