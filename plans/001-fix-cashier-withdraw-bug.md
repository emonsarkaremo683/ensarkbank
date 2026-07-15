# Plan 001: Fix Cashier WITHDRAW Accounting Bug

**Commit:** `44740aa`
**Finding:** #1 (CRITICAL)
**Effort:** M | **Risk:** Medium

## Problem

In `CashierTransactionServiceImpl.java:89-103`, both DEPOSIT and WITHDRAW branches pass identical arguments to `transactionService.createTransaction()`:
- Sender = `branchAcc.getAccountNumber()` (vault)
- Receiver = `request.getAccountNumber()` (customer)

For WITHDRAW, this is reversed. `cashWithdrawal()` debits its first param (customerAccount) and credits its second (cashVault). With swapped args, the vault is debited and customer is credited — creating money out of thin air.

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank/account_management/cashier_transaction/service/CashierTransactionServiceImpl.java` (lines 89-103)

**Files NOT to modify:**
- `TransactionServiceImpl.java` — the `createTransaction` method signature is correct
- `TransactionPostingService.java` — `cashDeposit`/`cashWithdrawal` methods are correct

## Current Code (lines 89-103)

```java
if(request.getType() == TransactionType.DEPOSIT){
    transactionService.createTransaction(
            request.getTransactionRequest(),
            transaction,
            branchAcc.getAccountNumber(),
            request.getAccountNumber()
    );
} else{
    transactionService.createTransaction(
            request.getTransactionRequest(),
            transaction,
            branchAcc.getAccountNumber(),
            request.getAccountNumber()
    );
}
```

## Required Change

Swap the sender/receiver arguments for the WITHDRAW (else) branch:

```java
if(request.getType() == TransactionType.DEPOSIT){
    transactionService.createTransaction(
            request.getTransactionRequest(),
            transaction,
            branchAcc.getAccountNumber(),  // sender = vault
            request.getAccountNumber()      // receiver = customer
    );
} else{
    transactionService.createTransaction(
            request.getTransactionRequest(),
            transaction,
            request.getAccountNumber(),      // sender = customer
            branchAcc.getAccountNumber()     // receiver = vault
    );
}
```

## Verification

1. Start backend: `mvn spring-boot:run`
2. Create a branch with a vault account (`br-XXXX`)
3. Create a customer account with balance $1000
4. Process a WITHDRAW cashier transaction for $100
5. Verify: customer balance decreased by $100, vault balance increased by $100
6. Process a DEPOSIT cashier transaction for $100
7. Verify: customer balance increased by $100, vault balance decreased by $100

## Maintenance Note

The `TransactionServiceImpl.createTransaction()` method takes `sender` and `receiverAccount` as strings. The `cashWithdrawal()` method in `TransactionPostingService` expects `customerAccount` first, `cashVault` second. Ensure the argument order matches the method contract.
