package com.elitetech_inc.ensarkbank.dashboard;

import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.account_management.loan.repository.LoanRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.enums.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final CardRepository cardRepository;
    private final BranchRepository branchRepository;

    public DashboardResponse getDashboardData(List<Long> branchIds) {
        DashboardResponse response = new DashboardResponse();

        if (branchIds == null) {
            response.setTotalAccounts(accountRepository.count());
            response.setTotalCustomers(accountRepository.countDistinctCustomersAll());
            response.setTotalTransactions(transactionRepository.countAll());
            response.setTotalLoans(loanRepository.countAll());
            response.setTotalBalance(accountRepository.sumBalanceByBranchIds(null));
            response.setTotalActiveCards(cardRepository.countByStatus(CardStatus.ACTIVE));
            response.setTransactionTrends(buildTransactionTrends(null));
            response.setAccountTypeDistribution(buildAccountTypeDistribution(null));
            response.setLoanStatusDistribution(buildLoanStatusDistribution(null));
            response.setTransactionTypeDistribution(buildTransactionTypeDistribution(null));
            response.setTransactionStatusDistribution(buildTransactionStatusDistribution(null));
            response.setBranchWiseSummary(buildBranchWiseSummary());
        } else {
            response.setTotalAccounts(accountRepository.countByBranchIdIn(branchIds));
            response.setTotalCustomers(accountRepository.countDistinctCustomersByBranchIds(branchIds));
            response.setTotalTransactions(transactionRepository.countByBranchIds(branchIds));
            response.setTotalLoans(loanRepository.countByBranchIds(branchIds));
            response.setTotalBalance(accountRepository.sumBalanceByBranchIds(branchIds));
            response.setTotalActiveCards(cardRepository.countByStatusAndBranchIds(CardStatus.ACTIVE, branchIds));
            response.setTransactionTrends(buildTransactionTrends(branchIds));
            response.setAccountTypeDistribution(buildAccountTypeDistribution(branchIds));
            response.setLoanStatusDistribution(buildLoanStatusDistribution(branchIds));
            response.setTransactionTypeDistribution(buildTransactionTypeDistribution(branchIds));
            response.setTransactionStatusDistribution(buildTransactionStatusDistribution(branchIds));
        }

        return response;
    }

    private List<DashboardResponse.TimeSeriesPoint> buildTransactionTrends(List<Long> branchIds) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        LocalDateTime start = today.minusDays(6).atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        List<Object[]> results;
        if (branchIds == null) {
            results = transactionRepository.sumAmountByDateRangeAll(start, end);
        } else {
            results = transactionRepository.sumAmountByDateRange(start, end, branchIds);
        }

        Map<String, DashboardResponse.TimeSeriesPoint> dateMap = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String label = date.format(formatter);
            dateMap.put(label, new DashboardResponse.TimeSeriesPoint(label, 0, BigDecimal.ZERO));
        }

        for (Object[] row : results) {
            if (row[0] != null) {
                LocalDate date = LocalDate.parse(row[0].toString());
                String label = date.format(formatter);
                long count = ((Number) row[1]).longValue();
                BigDecimal amount = (BigDecimal) row[2];
                dateMap.put(label, new DashboardResponse.TimeSeriesPoint(label, count, amount));
            }
        }

        return new ArrayList<>(dateMap.values());
    }

    private List<DashboardResponse.LabelValue> buildAccountTypeDistribution(List<Long> branchIds) {
        List<Object[]> results;
        if (branchIds == null) {
            results = accountRepository.countByAccountTypeGroupedAll();
        } else {
            results = accountRepository.countByAccountTypeGrouped(branchIds);
        }

        List<DashboardResponse.LabelValue> distribution = new ArrayList<>();
        for (Object[] row : results) {
            AccountType type = (AccountType) row[0];
            long count = ((Number) row[1]).longValue();
            distribution.add(new DashboardResponse.LabelValue(type.name(), count, BigDecimal.ZERO));
        }
        return distribution;
    }

    private List<DashboardResponse.LabelValue> buildLoanStatusDistribution(List<Long> branchIds) {
        List<Object[]> results;
        if (branchIds == null) {
            results = loanRepository.countByStatusGroupedAll();
        } else {
            results = loanRepository.countByStatusGrouped(branchIds);
        }

        List<DashboardResponse.LabelValue> distribution = new ArrayList<>();
        for (Object[] row : results) {
            LoanStatus status = (LoanStatus) row[0];
            long count = ((Number) row[1]).longValue();
            distribution.add(new DashboardResponse.LabelValue(status.name(), count, BigDecimal.ZERO));
        }
        return distribution;
    }

    private List<DashboardResponse.LabelValue> buildTransactionTypeDistribution(List<Long> branchIds) {
        List<Object[]> results;
        if (branchIds == null) {
            results = transactionRepository.countByTransactionTypeGroupedAll();
        } else {
            results = transactionRepository.countByTransactionTypeGrouped(branchIds);
        }

        List<DashboardResponse.LabelValue> distribution = new ArrayList<>();
        for (Object[] row : results) {
            TransactionType type = (TransactionType) row[0];
            long count = ((Number) row[1]).longValue();
            distribution.add(new DashboardResponse.LabelValue(type.name(), count, BigDecimal.ZERO));
        }
        return distribution;
    }

    private List<DashboardResponse.LabelValue> buildTransactionStatusDistribution(List<Long> branchIds) {
        List<Object[]> results;
        if (branchIds == null) {
            results = transactionRepository.countByStatusGroupedAll();
        } else {
            results = transactionRepository.countByStatusGrouped(branchIds);
        }

        List<DashboardResponse.LabelValue> distribution = new ArrayList<>();
        for (Object[] row : results) {
            TransactionStatus status = (TransactionStatus) row[0];
            long count = ((Number) row[1]).longValue();
            distribution.add(new DashboardResponse.LabelValue(status.name(), count, BigDecimal.ZERO));
        }
        return distribution;
    }

    private List<DashboardResponse.BranchSummary> buildBranchWiseSummary() {
        List<Object[]> results = accountRepository.getBranchWiseSummary();
        List<DashboardResponse.BranchSummary> summaries = new ArrayList<>();

        for (Object[] row : results) {
            Long branchId = ((Number) row[0]).longValue();
            String branchName = (String) row[1];
            long accountCount = ((Number) row[2]).longValue();
            long customerCount = ((Number) row[3]).longValue();
            BigDecimal totalBalance = (BigDecimal) row[4];

            summaries.add(new DashboardResponse.BranchSummary(
                    branchId,
                    branchName,
                    accountCount,
                    customerCount,
                    0,
                    totalBalance,
                    0
            ));
        }
        return summaries;
    }
}
