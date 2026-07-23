package com.elitetech_inc.ensarkbank.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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

    private TrendData customersTrend;
    private TrendData accountsTrend;
    private TrendData balanceTrend;
    private TrendData transactionsTrend;
    private TrendData loansTrend;
    private TrendData atmsTrend;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendData {
        private double percentageChange;
        private long currentCount;
        private long previousCount;
        private boolean up;
    }

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
