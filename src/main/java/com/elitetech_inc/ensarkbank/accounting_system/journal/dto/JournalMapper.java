package com.elitetech_inc.ensarkbank.accounting_system.journal.dto;

import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.Journal;
import com.elitetech_inc.ensarkbank.common.enums.AccountType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Transactional
public class JournalMapper {

    private final AccountRepository accountRepository;

    public JournalResponse toResponse(Journal journal) {
        JournalResponse jr = new JournalResponse();
        jr.setDate(journal.getCreatedAt());
        jr.setTransactionId(journal.getTransaction().getTransactionId());
        jr.setAccountNumber(journal.getAccountNumber());
        jr.setChannel(journal.getTransaction().getChannel());
        jr.setAmount(journal.getAmount());
        jr.setEntryType(journal.getEntryType());
        jr.setAccountName(getName(jr.getAccountNumber()));
        return jr;
    }

    private String getName(String accountNumber) {
        return accountRepository.findAccountByAccountNumber(accountNumber)
                .map(account -> {

                    if (account.getAccountType() == AccountType.BRANCH_VAULT) {
                        return account.getBranch().getName();
                    }

                    if (account.getHolders() == null || account.getHolders().isEmpty()) {
                        return account.getAccountNumber();
                    }

                    return account.getHolders().getFirst().getCustomer().getName();
                })
                .orElse("");
    }
}
