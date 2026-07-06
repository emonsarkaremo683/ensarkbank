package com.elitetech_inc.ensarkbank.atm_management.atm_transaction;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionService;
import com.elitetech_inc.ensarkbank.atm_management.atm.ATM;
import com.elitetech_inc.ensarkbank.atm_management.atm.ATMRepository;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionMapper;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionRequest;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionResponse;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ATMTransactionServiceImpl implements ATMTransactionService {

    private final ATMTransactionRepository atmTransactionRepository;
    private final ATMTransactionMapper atmTransactionMapper;
    private final CardRepository cardRepository;
    private final ATMRepository atmRepository;
    private final TransactionService transactionService;
    private final AccountRepository accountRepository;

    @Override
    public ATMTransactionResponse transaction(ATMTransactionRequest request) {
        ATM atm = atmRepository.findById(request.getAtmId()).orElseThrow(
                () -> new RuntimeException("ATM Not Found")
        );

        if (atm.getStatus() != com.elitetech_inc.ensarkbank.common.enums.ATMStatus.ACTIVE) {
            throw new RuntimeException("ATM is not active");
        }

        Card card = cardRepository.findById(request.getCardId()).orElseThrow(
                () -> new RuntimeException("Card Not Found")
        );

        Transaction t = new Transaction();
        t.setChannel(com.elitetech_inc.ensarkbank.common.enums.TransactionChannel.ATM);

        ATMTransaction att = new ATMTransaction();
        att.setAtm(atm);
        att.setCard(card);
        att.setTransactionType(request.getTransactionType());

        switch (request.getTransactionType()) {
            case CASH_WITHDRAW -> {
                Account customerAccount = accountRepository.findAccountByAccountNumber(
                        card.getAccount().getAccountNumber()
                ).orElseThrow(() -> new RuntimeException("Customer account not found"));

                Account atmAccount = accountRepository.findAccountByAccountNumber(
                        atm.getAccount().getAccountNumber()
                ).orElseThrow(() -> new RuntimeException("ATM account not found"));

                BigDecimal withdrawAmount = request.getTransactionRequest().getAmount();
                if (atmAccount.getAvailableBalance().compareTo(withdrawAmount) < 0) {
                    throw new RuntimeException("Insufficient ATM balance");
                }
                if (customerAccount.getAvailableBalance().compareTo(withdrawAmount) < 0) {
                    throw new RuntimeException("Insufficient customer balance");
                }
                if (atm.getLimit() != null && withdrawAmount.compareTo(atm.getLimit()) > 0) {
                    throw new RuntimeException("Amount exceeds ATM limit");
                }

                transactionService.atmWithdraw(request.getTransactionRequest(), customerAccount, atmAccount);
            }
            case CASH_DEPOSIT -> {
                Account customerAccount = accountRepository.findAccountByAccountNumber(
                        card.getAccount().getAccountNumber()
                ).orElseThrow(() -> new RuntimeException("Customer account not found"));

                Account atmAccount = accountRepository.findAccountByAccountNumber(
                        atm.getAccount().getAccountNumber()
                ).orElseThrow(() -> new RuntimeException("ATM account not found"));

                transactionService.atmDeposit(request.getTransactionRequest(), atmAccount, customerAccount);
            }
            default -> throw new RuntimeException("Invalid Transaction Type");
        }

        att.setTransaction(t);
        return atmTransactionMapper.toResponse(atmTransactionRepository.save(att));
    }

    @Override
    public ATMTransactionResponse refill(Long atmId, BigDecimal amount) {
        ATM atm = atmRepository.findById(atmId).orElseThrow(
                () -> new RuntimeException("ATM Not Found")
        );

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid refill amount");
        }

        Account atmAccount = accountRepository.findAccountByAccountNumber(
                atm.getAccount().getAccountNumber()
        ).orElseThrow(() -> new RuntimeException("ATM account not found"));

        atmAccount.setAvailableBalance(atmAccount.getAvailableBalance().add(amount));
        atmAccount.setCurrentBalance(atmAccount.getCurrentBalance().add(amount));
        accountRepository.save(atmAccount);

        Transaction t = new Transaction();
        t.setChannel(TransactionChannel.ATM);
        t.setTransactionType(TransactionType.DEPOSIT);
        t.setAmount(amount);
        t.setRemarks("ATM Refill");

        ATMTransaction att = new ATMTransaction();
        att.setAtm(atm);
        att.setTransaction(t);
        att.setTransactionType(com.elitetech_inc.ensarkbank.common.enums.ATMTransactionType.REFILL);

        return atmTransactionMapper.toResponse(atmTransactionRepository.save(att));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ATMTransactionResponse> getAll() {
        return atmTransactionRepository.findAll()
                .stream()
                .map(atmTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ATMTransactionResponse getById(Long id) {
        ATMTransaction atmTransaction = atmTransactionRepository.findById(id).orElseThrow(
                () -> new RuntimeException("ATM Transaction Not Found")
        );
        return atmTransactionMapper.toResponse(atmTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ATMTransactionResponse> getByAtmId(Long atmId) {
        return atmTransactionRepository.findByAtmId(atmId)
                .stream()
                .map(atmTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }
}
