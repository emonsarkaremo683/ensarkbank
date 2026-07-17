package com.ensark.ensarkbank.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private long totalAccounts;
    private long totalCustomers;
    private long totalTransactions;
    private long totalLoans;
    private BigDecimal totalBalance;
    private long totalActiveCards;

    private List<TimeSeriesPoint> transactionTrends;
    private List<LabelValue> accountTypeDistribution;
    private List<LabelValue> loanStatusDistribution;
    private List<LabelValue> transactionTypeDistribution;
    private List<LabelValue> transactionStatusDistribution;
    private List<BranchSummary> branchWiseSummary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String date;
        private long count;
        private BigDecimal totalAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LabelValue {
        private String label;
        private long value;
        private BigDecimal totalAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchSummary {
        private Long branchId;
        private String branchName;
        private long accountCount;
        private long customerCount;
        private long transactionCount;
        private BigDecimal totalBalance;
        private long loanCount;
    }
}
