package com.ensark.ensarkbank.enums;

public enum AccountCategory {

    CASH_VAULT("GL1001", "Cash Vault"),
    ATM_CASH("GL1002", "ATM Cash"),

    CUSTOMER_DEPOSIT("GL2000", "Customer Deposit Control"),

    SAVINGS_DEPOSIT("GL2001", "Savings Deposit Liability"),
    CURRENT_DEPOSIT("GL2002", "Current Deposit Liability"),
    FIXED_DEPOSIT("GL2003", "Fixed Deposit Liability"),

    LOAN_PORTFOLIO("GL3001", "Loan Portfolio"),
    LOAN_INTEREST("GL3002", "Loan Interest Receivable"),

    INTEREST_INCOME("GL4001", "Interest Income"),
    INTEREST_EXPENSE("GL4002", "Interest Expense"),

    SERVICE_CHARGE_INCOME("GL4003", "Service Charge Income"),
    PENALTY_INCOME("GL4004", "Penalty Income"),

    SUSPENSE("GL5001", "Suspense Account"),

    INTER_BRANCH_SETTLEMENT("GL6001", "Inter Branch Settlement"),

    TAX_PAYABLE("GL7001", "Tax Payable");

    private final String glCode;
    private final String accountName;

    AccountCategory(String glCode, String accountName) {
        this.glCode = glCode;
        this.accountName = accountName;
    }

    public String getGlCode() {
        return glCode;
    }

    public String getAccountName() {
        return accountName;
    }
}