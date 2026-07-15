# Plan 002: Fix Dashboard Branch Filtering + OOM Risk + SQL Aggregations

**Commit:** `44740aa`
**Finding:** #2, #4, #14 (HIGH)
**Effort:** L | **Risk:** Medium

## Problem

1. `DashboardService.getAllTransactions()` and `getAllLoans()` accept `branchIds` but always call `findAll()` — branch managers see global data
2. `countActiveCards()` loads ALL cards into memory just to count active ones
3. `buildBranchWiseSummary()` loads ALL branches, then for each branch loads ALL accounts (N+1)
4. `countDistinctCustomers()` triggers N+1 lazy loads on `Account.holders` and `AccountHolder.customer`
5. All dashboard queries load full entity lists into JVM memory — will OOM at scale

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank\dashboard\DashboardService.java`
- `src/main/java/com/elitetech_inc/ensarkbank\account_management\account\repository\AccountRepository.java`
- `src/main/java/com/elitetech_inc/ensarkbank\accounting_system\transaction\repository\TransactionRepository.java`
- `src/main/java/com/elitetech_inc/ensarkbank\account_management\loan\repository\LoanRepository.java`
- `src/main/java/com/elitetech_inc/ensarkbank\account_management\card\repository\CardRepository.java`

**Files NOT to modify:**
- `DashboardController.java` — endpoint signature stays the same
- `DashboardResponse.java` — response structure stays the same

## Required Changes

### Step 1: Add repository query methods

**AccountRepository.java** — add:
```java
long countByBranchIdIn(List<Long> branchIds);
long countByBranchId(Long branchId);
```

**TransactionRepository.java** — add:
```java
long countByBranchIds(List<Long> branchIds);
List<Object[]> countByTransactionTypeGrouped(List<Long> branchIds);
List<Object[]> countByStatusGrouped(List<Long> branchIds);
List<Object[]> sumAmountByDateRange(LocalDateTime start, LocalDateTime end, List<Long> branchIds);
```

**LoanRepository.java** — add:
```java
long countByBranchIds(List<Long> branchIds);
List<Object[]> countByStatusGrouped(List<Long> branchIds);
```

**CardRepository.java** — add:
```java
long countByStatusAndBranchIds(CardStatus status, List<Long> branchIds);
```

### Step 2: Rewrite DashboardService methods

Replace entity-loading methods with JPQL aggregate queries:

```java
// Before: loads ALL transactions into memory
private List<Transaction> getAllTransactions(List<Long> branchIds) {
    if (branchIds == null) return transactionRepository.findAll();
    return transactionRepository.findAll(); // BUG: ignores branchIds
}

// After: use COUNT query
private long countTransactions(List<Long> branchIds) {
    if (branchIds == null) return transactionRepository.count();
    return transactionRepository.countByBranchIds(branchIds);
}
```

Replace `countDistinctCustomers()` with JPQL:
```java
@Query("SELECT COUNT(DISTINCT ah.customer.id) FROM Account a JOIN a.holders ah WHERE a.branch.id IN :branchIds")
long countDistinctCustomersByBranchIds(List<Long> branchIds);
```

Replace `buildBranchWiseSummary()` with a single grouped query:
```java
@Query("SELECT a.branch.id, a.branch.name, COUNT(a), COUNT(DISTINCT ah.customer.id), SUM(a.availableBalance) " +
       "FROM Account a JOIN a.holders ah WHERE a.branch.type <> 'HEAD_OFFICE' GROUP BY a.branch.id, a.branch.name")
List<Object[]> getBranchWiseSummary();
```

### Step 3: Fix countActiveCards branch filtering

```java
private long countActiveCards(List<Long> branchIds) {
    if (branchIds == null) {
        return cardRepository.countByStatus(CardStatus.ACTIVE);
    }
    return cardRepository.countByStatusAndBranchIds(CardStatus.ACTIVE, branchIds);
}
```

## Verification

1. Run backend: `mvn spring-boot:run`
2. Login as BRANCH_MANAGER (branch-scoped user)
3. Verify dashboard shows only branch-specific stats
4. Login as SUPER_ADMIN (head office)
5. Verify dashboard shows global stats
6. Check server logs for SQL query count — should be ≤5 queries instead of 50+

## Maintenance Note

- The `DashboardResponse` structure is unchanged — frontend needs no changes
- If OSIV is disabled in the future, these JPQL queries will still work since they don't rely on lazy loading
- Consider adding database indexes on `accounts.branch_id`, `transactions.created_at`, `loan_applications.status` for query performance
