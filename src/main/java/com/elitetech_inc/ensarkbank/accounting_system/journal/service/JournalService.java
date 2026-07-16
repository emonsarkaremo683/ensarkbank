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

    public List<JournalResponse> getJournalByAccountId(Long customerId, LocalDateTime startDate, LocalDateTime endDate){
        LocalDateTime from = startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime to = endDate != null ? endDate : LocalDateTime.now();

        List<String> accountNumbers = accountRepository
                .findDistinctByHoldersCustomerId(customerId)
                .stream()
                .map(Account::getAccountNumber)
                .toList();

        if (accountNumbers.isEmpty()) {
            return List.of();
        }

        return journalRepository.findTransactionHistory(accountNumbers, from, to)
                .stream().map(journalMapper::toResponse).toList();
    }

    public List<JournalResponse> getAllJournals() {
        return journalRepository.findAllJournals()
                .stream()
                .map(journalMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<JournalResponse> getJournalsByBranchId(Long branchId) {
        return journalRepository.findByBranchId(branchId)
                .stream()
                .map(journalMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<JournalResponse> getJournalsByAccountNumberAndBranchId(String accountNumber, Long branchId) {
        return journalRepository.findByBranchId(branchId)
                .stream()
                .filter(j -> j.getAccountNumber().equals(accountNumber))
                .map(journalMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<JournalResponse> getJournalsByBranchIds(List<Long> branchIds) {
        if (branchIds == null || branchIds.isEmpty()) {
            return getAllJournals();
        }
        return branchIds.stream()
                .map(journalRepository::findByBranchId)
                .flatMap(List::stream)
                .distinct()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(journalMapper::toResponse)
                .collect(Collectors.toList());
    }

}
