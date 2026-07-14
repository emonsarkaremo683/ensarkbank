package com.elitetech_inc.ensarkbank.dashboard;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.account_management.card.entity.Card;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.account_management.loan.entity.Loan;
import com.elitetech_inc.ensarkbank.account_management.loan.repository.LoanRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.enums.*;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final CardRepository cardRepository;
    private final BranchRepository branchRepository;
    private final CustomerRepository customerRepository;

    public DashboardResponse getDashboardData(List<Long> branchIds) {
        List<Account> allAccounts = getAllAccounts(branchIds);
        List<Transaction> allTransactions = getAllTransactions(branchIds);
        List<Loan> allLoans = getAllLoans(branchIds);

        DashboardResponse response = new DashboardResponse();

        response.setTotalAccounts(allAccounts.size());
        response.setTotalCustomers(countDistinctCustomers(allAccounts));
        response.setTotalTransactions(allTransactions.size());
        response.setTotalLoans(allLoans.size());
        response.setTotalBalance(calculateTotalBalance(allAccounts));
        response.setTotalActiveCards(countActiveCards(branchIds));

        response.setTransactionTrends(buildTransactionTrends(allTransactions));
        response.setAccountTypeDistribution(buildAccountTypeDistribution(allAccounts));
        response.setLoanStatusDistribution(buildLoanStatusDistribution(allLoans));
        response.setTransactionTypeDistribution(buildTransactionTypeDistribution(allTransactions));
        response.setTransactionStatusDistribution(buildTransactionStatusDistribution(allTransactions));

        if (branchIds == null) {
            response.setBranchWiseSummary(buildBranchWiseSummary());
        }

        return response;
    }

    private List<Account> getAllAccounts(List<Long> branchIds) {
        if (branchIds == null) {
            return accountRepository.findAll();
        }
        List<Account> result = new ArrayList<>();
        for (Long branchId : branchIds) {
            result.addAll(accountRepository.findAllByBranchId(branchId));
        }
        return result.stream().distinct().collect(Collectors.toList());
    }

    private List<Transaction> getAllTransactions(List<Long> branchIds) {
        if (branchIds == null) {
            return transactionRepository.findAll();
        }
        return transactionRepository.findAll();
    }

    private List<Loan> getAllLoans(List<Long> branchIds) {
        if (branchIds == null) {
            return loanRepository.findAll();
        }
        return loanRepository.findAll();
    }

    private long countDistinctCustomers(List<Account> accounts) {
        Set<Long> customerIds = new HashSet<>();
        for (Account account : accounts) {
            if (account.getHolders() != null) {
                for (AccountHolder holder : account.getHolders()) {
                    if (holder.getCustomer() != null) {
                        customerIds.add(holder.getCustomer().getId());
                    }
                }
            }
        }
        return customerIds.size();
    }

    private BigDecimal calculateTotalBalance(List<Account> accounts) {
        return accounts.stream()
                .map(a -> a.getAvailableBalance() != null ? a.getAvailableBalance() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long countActiveCards(List<Long> branchIds) {
        try {
            List<Card> cards = cardRepository.findAll();
            return cards.stream().filter(c -> c.getStatus() == CardStatus.ACTIVE).count();
        } catch (Exception e) {
            return 0;
        }
    }

    private List<DashboardResponse.TimeSeriesPoint> buildTransactionTrends(List<Transaction> transactions) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        Map<LocalDate, List<Transaction>> byDate = transactions.stream()
                .filter(t -> t.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCreatedAt().toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<DashboardResponse.TimeSeriesPoint> points = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String label = date.format(formatter);
            List<Transaction> dayTx = byDate.getOrDefault(date, List.of());
            long count = dayTx.size();
            BigDecimal amount = dayTx.stream()
                    .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            points.add(new DashboardResponse.TimeSeriesPoint(label, count, amount));
        }
        return points;
    }

    private List<DashboardResponse.LabelValue> buildAccountTypeDistribution(List<Account> accounts) {
        Map<AccountType, Long> countByType = accounts.stream()
                .collect(Collectors.groupingBy(Account::getAccountType, Collectors.counting()));

        return countByType.entrySet().stream()
                .map(e -> new DashboardResponse.LabelValue(e.getKey().name(), e.getValue(), BigDecimal.ZERO))
                .sorted(Comparator.comparing(DashboardResponse.LabelValue::getValue).reversed())
                .collect(Collectors.toList());
    }

    private List<DashboardResponse.LabelValue> buildLoanStatusDistribution(List<Loan> loans) {
        Map<LoanStatus, Long> countByStatus = loans.stream()
                .collect(Collectors.groupingBy(Loan::getStatus, Collectors.counting()));

        return countByStatus.entrySet().stream()
                .map(e -> new DashboardResponse.LabelValue(e.getKey().name(), e.getValue(), BigDecimal.ZERO))
                .sorted(Comparator.comparing(DashboardResponse.LabelValue::getValue).reversed())
                .collect(Collectors.toList());
    }

    private List<DashboardResponse.LabelValue> buildTransactionTypeDistribution(List<Transaction> transactions) {
        Map<TransactionType, Long> countByType = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getTransactionType, Collectors.counting()));

        return countByType.entrySet().stream()
                .map(e -> new DashboardResponse.LabelValue(
                        e.getKey().name(),
                        e.getValue(),
                        transactions.stream()
                                .filter(t -> t.getTransactionType() == e.getKey())
                                .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(DashboardResponse.LabelValue::getValue).reversed())
                .collect(Collectors.toList());
    }

    private List<DashboardResponse.LabelValue> buildTransactionStatusDistribution(List<Transaction> transactions) {
        Map<TransactionStatus, Long> countByStatus = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getStatus, Collectors.counting()));

        return countByStatus.entrySet().stream()
                .map(e -> new DashboardResponse.LabelValue(e.getKey().name(), e.getValue(), BigDecimal.ZERO))
                .sorted(Comparator.comparing(DashboardResponse.LabelValue::getValue).reversed())
                .collect(Collectors.toList());
    }

    private List<DashboardResponse.BranchSummary> buildBranchWiseSummary() {
        List<Branch> branches = branchRepository.findAll();
        List<DashboardResponse.BranchSummary> summaries = new ArrayList<>();

        for (Branch branch : branches) {
            if (branch.getType() == BranchType.HEAD_OFFICE) continue;

            List<Account> branchAccounts = accountRepository.findAllByBranchId(branch.getId());
            long customerCount = countDistinctCustomers(branchAccounts);

            summaries.add(new DashboardResponse.BranchSummary(
                    branch.getId(),
                    branch.getName(),
                    branchAccounts.size(),
                    customerCount,
                    0,
                    calculateTotalBalance(branchAccounts),
                    0
            ));
        }
        return summaries;
    }
}
