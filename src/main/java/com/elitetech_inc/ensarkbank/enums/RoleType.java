package com.elitetech_inc.ensarkbank.enums;

public enum RoleType {
    ADMIN,
    BRANCH_MANAGER,
    ACCOUNTANT,
    CASHIER,
    LOAN_OFFICER,
    CUSTOMER_SERVICE,
    ATM_MANAGER,
    AUDITOR,
    CUSTOMER;

    // Returns Spring Security compatible authority string
    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
