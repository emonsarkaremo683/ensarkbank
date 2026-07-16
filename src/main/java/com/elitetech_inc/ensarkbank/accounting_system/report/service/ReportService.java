package com.elitetech_inc.ensarkbank.accounting_system.report.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.Journal;
import com.elitetech_inc.ensarkbank.accounting_system.journal.repository.JournalRepository;
import com.elitetech_inc.ensarkbank.accounting_system.report.dto.request.ReportRequest;
import com.elitetech_inc.ensarkbank.accounting_system.report.dto.response.*;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.enums.EntryType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final JournalRepository journalRepository;
    private final AccountRepository accountRepository;
    private final BranchRepository branchRepository;

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private static final List<String> ALL_BRANCH_ROLES = List.of("SUPER_ADMIN", "ADMIN", "AUDITOR", "ACCOUNTANT");

    public List<Branch> resolveBranches(ReportRequest request) {
        String role = request.getRole();
        Long branchId = request.getBranchId();
        Long userBranchId = request.getUserBranchId();

        boolean canViewAll = role != null && ALL_BRANCH_ROLES.contains(role) && userBranchId == null;

        if (canViewAll) {
            // Head office staff (no branch assignment) — can view any branch or all branches
            if (branchId != null) {
                return branchRepository.findById(branchId)
                        .map(List::of)
                        .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + branchId));
            }
            return branchRepository.findAll();
        }

        // Branch-assigned staff (Branch Manager, Cashier, or Accountant at a branch) — only their branch
        if (userBranchId != null) {
            return branchRepository.findById(userBranchId)
                    .map(List::of)
                    .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + userBranchId));
        }
        return List.of();
    }

    private List<Journal> fetchJournals(Branch branch, ReportRequest request) {
        LocalDate fromDate = request.getFromDate();
        LocalDate toDate = request.getToDate();

        if (fromDate != null && toDate != null) {
            LocalDateTime from = fromDate.atStartOfDay();
            LocalDateTime to = toDate.atTime(23, 59, 59);
            return journalRepository.findByBranchIdAndDateRange(branch.getId(), from, to);
        }
        if (fromDate != null || toDate != null) {
            LocalDateTime f = fromDate != null ? fromDate.atStartOfDay() : LocalDateTime.MIN;
            LocalDateTime t = toDate != null ? toDate.atTime(23, 59, 59) : LocalDateTime.MAX;
            return journalRepository.findByBranchIdAndDateRange(branch.getId(), f, t);
        }
        return journalRepository.findByBranchId(branch.getId());
    }

    public LedgerResponse getLedger(Long branchId, String accountNumber, ReportRequest request) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + branchId));

        Account account = accountRepository.findAccountByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountNumber));

        if (account.getBranch() == null || !account.getBranch().getId().equals(branchId)) {
            throw new IllegalArgumentException("Account does not belong to branch: " + branchId);
        }

        List<Journal> journals = account.getBranch() != null
                ? filterByDate(journalRepository.getJournalsByAccountNumber(accountNumber), request)
                : List.of();

        journals.sort(Comparator.comparing(J -> J.getCreatedAt() == null ? LocalDateTime.MIN : J.getCreatedAt()));

        BigDecimal balance = account.getCurrentBalance() != null ? account.getCurrentBalance() : ZERO;
        if (!journals.isEmpty()) {
            balance = ZERO;
            for (Journal j : journals) {
                balance = applyEntry(balance, j);
            }
        }

        LedgerResponse response = new LedgerResponse();
        response.setBranchId(branch.getId());
        response.setBranchName(branch.getName());
        response.setAccountNumber(accountNumber);
        response.setOpeningBalance(journals.isEmpty() ? balance : computeOpening(journals));
        response.setClosingBalance(balance);

        List<LedgerLineResponse> lines = new ArrayList<>();
        BigDecimal running = response.getOpeningBalance();
        for (Journal j : journals) {
            running = applyEntry(running, j);
            LedgerLineResponse line = new LedgerLineResponse();
            line.setJournalId(j.getId());
            line.setDate(j.getCreatedAt());
            line.setTransactionId(j.getTransaction().getTransactionId());
            line.setParticulars(j.getEntryType() == EntryType.DEBIT ? "Debit" : "Credit");
            line.setAccountNumber(j.getAccountNumber());
            line.setAccountName(account.getBranch() != null ? account.getBranch().getName() : accountNumber);
            line.setDebit(j.getEntryType() == EntryType.DEBIT ? j.getAmount() : ZERO);
            line.setCredit(j.getEntryType() == EntryType.CREDIT ? j.getAmount() : ZERO);
            line.setBalance(running);
            lines.add(line);
        }
        response.setEntries(lines);
        return response;
    }

    public List<LedgerResponse> getLedgers(ReportRequest request) {
        List<LedgerResponse> result = new ArrayList<>();
        for (Branch branch : resolveBranches(request)) {
            List<Account> accounts = accountRepository.findAllByBranchId(branch.getId());
            for (Account account : accounts) {
                result.add(getLedger(branch.getId(), account.getAccountNumber(), request));
            }
        }
        return result;
    }

    public TrialBalanceResponse getTrialBalance(ReportRequest request) {
        TrialBalanceResponse response = new TrialBalanceResponse();
        BigDecimal totalDebit = ZERO;
        BigDecimal totalCredit = ZERO;
        List<TrialBalanceLineResponse> lines = new ArrayList<>();

        for (Branch branch : resolveBranches(request)) {
            Map<String, TrialBalanceLineResponse> byAccount = new LinkedHashMap<>();
            for (Journal j : fetchJournals(branch, request)) {
                Account account = j.getAccount();
                String key = account.getAccountNumber();
                TrialBalanceLineResponse line = byAccount.computeIfAbsent(key, k -> {
                    TrialBalanceLineResponse l = new TrialBalanceLineResponse();
                    l.setAccountNumber(k);
                    l.setAccountName(account.getBranch() != null ? account.getBranch().getName() : k);
                    l.setGlCode("ACC-" + account.getId());
                    l.setDebit(ZERO);
                    l.setCredit(ZERO);
                    return l;
                });
                if (j.getEntryType() == EntryType.DEBIT) {
                    line.setDebit(line.getDebit().add(j.getAmount()));
                } else {
                    line.setCredit(line.getCredit().add(j.getAmount()));
                }
            }
            for (TrialBalanceLineResponse line : byAccount.values()) {
                totalDebit = totalDebit.add(line.getDebit());
                totalCredit = totalCredit.add(line.getCredit());
                lines.add(line);
            }
        }

        response.setBranchId(request.getBranchId());
        response.setBranchName(branchName(request.getBranchId()));
        response.setLines(lines);
        response.setTotalDebit(totalDebit);
        response.setTotalCredit(totalCredit);
        return response;
    }

    public BalanceSheetResponse getBalanceSheet(ReportRequest request) {
        BalanceSheetResponse response = new BalanceSheetResponse();
        response.setBranchId(request.getBranchId());
        response.setBranchName(branchName(request.getBranchId()));

        BalanceSheetSection assets = new BalanceSheetSection();
        assets.setTitle("Assets");
        BalanceSheetSection liabilities = new BalanceSheetSection();
        liabilities.setTitle("Liabilities");
        BalanceSheetSection equity = new BalanceSheetSection();
        equity.setTitle("Equity");

        Map<String, BalanceSheetSectionLine> assetLines = new LinkedHashMap<>();
        Map<String, BalanceSheetSectionLine> liabilityLines = new LinkedHashMap<>();

        for (Branch branch : resolveBranches(request)) {
            List<Account> accounts = accountRepository.findAllByBranchId(branch.getId());
            for (Account account : accounts) {
                BigDecimal balance = account.getCurrentBalance() != null ? account.getCurrentBalance() : ZERO;
                if (balance.compareTo(ZERO) == 0) continue;

                boolean isAsset = isAssetAccount(account);
                BalanceSheetSectionLine line = new BalanceSheetSectionLine();
                line.setGlCode("ACC-" + account.getId());
                line.setAccountName(account.getBranch() != null ? account.getBranch().getName() : account.getAccountNumber());
                line.setAmount(balance.abs());

                if (isAsset) {
                    if (balance.compareTo(ZERO) > 0) {
                        put(assetLines, "ACC-" + account.getId(), line);
                    } else {
                        put(liabilityLines, "ACC-" + account.getId(), line);
                    }
                } else {
                    if (balance.compareTo(ZERO) > 0) {
                        put(liabilityLines, "ACC-" + account.getId(), line);
                    } else {
                        put(assetLines, "ACC-" + account.getId(), line);
                    }
                }
            }
        }

        assets.setLines(new ArrayList<>(assetLines.values()));
        liabilities.setLines(new ArrayList<>(liabilityLines.values()));
        assets.setTotal(sum(assets.getLines()));
        liabilities.setTotal(sum(liabilities.getLines()));

        BigDecimal totalAssets = assets.getTotal();
        BigDecimal totalLiabilities = liabilities.getTotal();
        BigDecimal equityAmount = totalAssets.subtract(totalLiabilities);

        BalanceSheetSectionLine capitalLine = new BalanceSheetSectionLine();
        capitalLine.setGlCode("GL-EQ");
        capitalLine.setAccountName("Capital");
        capitalLine.setAmount(equityAmount.abs());
        Map<String, BalanceSheetSectionLine> equityLines = new LinkedHashMap<>();
        equityLines.put("CAPITAL", capitalLine);
        equity.setLines(new ArrayList<>(equityLines.values()));
        equity.setTotal(equityAmount.abs());

        response.setAssets(assets);
        response.setLiabilities(liabilities);
        response.setEquity(equity);
        response.setTotalAssets(totalAssets);
        response.setTotalLiabilitiesAndEquity(totalLiabilities.add(equity.getTotal()));
        return response;
    }

    private boolean isAssetAccount(Account account) {
        return switch (account.getAccountType()) {
            case BRANCH_VAULT, ATM_VAULT, INTER_BANK_VAULT, AGENT_BANK_VAULT, LOAN_VAULT -> true;
            default -> false;
        };
    }

    private void put(Map<String, BalanceSheetSectionLine> map, String key, BalanceSheetSectionLine line) {
        map.merge(key, line, (a, b) -> {
            a.setAmount(a.getAmount().add(b.getAmount()));
            return a;
        });
    }

    private BigDecimal sum(List<BalanceSheetSectionLine> lines) {
        return lines.stream().map(BalanceSheetSectionLine::getAmount)
                .reduce(ZERO, BigDecimal::add);
    }

    private BigDecimal computeOpening(List<Journal> journals) {
        return ZERO;
    }

    private BigDecimal applyEntry(BigDecimal balance, Journal j) {
        if (j.getEntryType() == EntryType.DEBIT) {
            return balance.add(j.getAmount());
        }
        return balance.subtract(j.getAmount());
    }

    private List<Journal> filterByDate(List<Journal> journals, ReportRequest request) {
        LocalDate fromDate = request.getFromDate();
        LocalDate toDate = request.getToDate();
        if (fromDate == null && toDate == null) {
            return journals;
        }
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(23, 59, 59) : null;
        return journals.stream().filter(j -> {
            LocalDateTime d = j.getCreatedAt();
            if (d == null) return false;
            if (from != null && d.isBefore(from)) return false;
            return to == null || !d.isAfter(to);
        }).collect(Collectors.toList());
    }

    private String branchName(Long branchId) {
        if (branchId == null) {
            return "ALL BRANCHES";
        }
        return branchRepository.findById(branchId).map(Branch::getName).orElse("UNKNOWN");
    }
}
