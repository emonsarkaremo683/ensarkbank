package com.elitetech_inc.ensarkbank.accounting_system.journal.dto;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.repository.AccountTransactionRepository;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.CashierTransaction;
import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.Journal;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class JournalMapper {

    private final AccountTransactionRepository accountTransactionRepository;

    public JournalResponse toResponse(Journal journal) {
        JournalResponse jr = new JournalResponse();
        jr.setAccountNumber(journal.getAccountNumber());
        jr.setAmount(journal.getAmount());

        return jr;
    }


    private String getName(AccountTransaction at){
        return at.getReceiverName();
    }


}
