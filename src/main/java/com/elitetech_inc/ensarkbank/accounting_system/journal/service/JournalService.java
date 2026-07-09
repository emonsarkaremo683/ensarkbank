package com.elitetech_inc.ensarkbank.accounting_system.journal.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalMapper;
import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalResponse;
import com.elitetech_inc.ensarkbank.accounting_system.journal.repository.JournalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final JournalMapper journalMapper;
    private final AccountRepository accountRepository;

    public List<JournalResponse> getByAccountNumber(String accountNumber){
        return journalRepository.getJournalsByAccountNumber(accountNumber)
                .stream()
                .map(journalMapper::toResponse)
                .collect(Collectors.toList());
    }

    public Optional<JournalResponse> getJournalByJournalId(Long journalId){
        return journalRepository.findById(journalId).map(journalMapper::toResponse);
    }

    public List<JournalResponse> getJournalByAccountNumber(Long customerId, LocalDateTime startDate, LocalDateTime endDate){
        List<String> accountNumbers = accountRepository
                .findDistinctByHoldersCustomerId(customerId)
                .stream()
                .map(Account::getAccountNumber)
                .toList();

        return journalRepository.findTransactionHistory(accountNumbers, startDate, endDate)
                .stream().map(journalMapper::toResponse).toList();
    }

}
