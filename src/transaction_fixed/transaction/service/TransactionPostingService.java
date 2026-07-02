package com.elitetech_inc.ensarkbank.transaction.service;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.EntryType;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.transaction.entity.TransactionEntry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class TransactionPostingService {

    /*
     * =====================================================
     * CREDIT POSTING
     * =====================================================
     * Use cases: Deposit, Interest Posting, Refund, Inward Transfer
     * Effect: availableBalance ↑  currentBalance ↑
     */
    public void credit(Transaction transaction, Account account, BigDecimal amount) {

        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setCurrentBalance(account.getCurrentBalance().add(amount));

        addEntry(transaction, account, EntryType.CREDIT, amount);
    }

    /*
     * =====================================================
     * DEBIT POSTING
     * =====================================================
     * Use cases: Withdrawal, ATM, Fee, Penalty, Loan Repayment
     * Effect: availableBalance ↓  currentBalance ↓
     */
    public void debit(Transaction transaction, Account account, BigDecimal amount) {

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setCurrentBalance(account.getCurrentBalance().subtract(amount));

        addEntry(transaction, account, EntryType.DEBIT, amount);
    }

    /*
     * =====================================================
     * INTERNAL ACCOUNT TRANSFER  (same bank)
     * =====================================================
     * Customer A → Customer B
     * Sender DEBIT | Receiver CREDIT
     *
     * If charge/vat exist they are debited from sender separately
     * and credited to fee/vat income accounts via feeCharge().
     */
    public void transfer(
            Transaction transaction,
            Account sender,
            Account receiver,
            BigDecimal amount
    ) {
        debit(transaction, sender, amount);
        credit(transaction, receiver, amount);
    }

    /*
     * =====================================================
     * OUTWARD BANK TRANSFER  (our bank → other bank)
     * =====================================================
     * Customer Account       DEBIT
     * Settlement Account     CREDIT
     */
    public void outwardTransfer(
            Transaction transaction,
            Account customerAccount,
            Account settlementAccount,
            BigDecimal amount
    ) {
        debit(transaction, customerAccount, amount);
        credit(transaction, settlementAccount, amount);
    }

    /*
     * =====================================================
     * INWARD BANK TRANSFER  (other bank → our bank)
     * =====================================================
     * Settlement Account     DEBIT
     * Customer Account       CREDIT
     */
    public void inwardTransfer(
            Transaction transaction,
            Account settlementAccount,
            Account customerAccount,
            BigDecimal amount
    ) {
        debit(transaction, settlementAccount, amount);
        credit(transaction, customerAccount, amount);
    }

    /*
     * =====================================================
     * ATM CASH DEPOSIT
     * =====================================================
     * ATM Cash Account       DEBIT
     * Customer Account       CREDIT
     */
    public void atmCashDeposit(
            Transaction transaction,
            Account atmCashAccount,
            Account customerAccount,
            BigDecimal amount
    ) {
        debit(transaction, atmCashAccount, amount);
        credit(transaction, customerAccount, amount);
    }

    /*
     * =====================================================
     * ATM WITHDRAWAL
     * =====================================================
     * Customer Account       DEBIT
     * ATM Cash Account       CREDIT
     */
    public void atmWithdrawal(
            Transaction transaction,
            Account customerAccount,
            Account atmCashAccount,
            BigDecimal amount
    ) {
        debit(transaction, customerAccount, amount);
        credit(transaction, atmCashAccount, amount);
    }

    /*
     * =====================================================
     * CASH DEPOSIT (BRANCH)
     * =====================================================
     * Cash Vault             DEBIT
     * Customer Account       CREDIT
     */
    public void cashDeposit(
            Transaction transaction,
            Account cashVault,
            Account customerAccount,
            BigDecimal amount
    ) {
        debit(transaction, cashVault, amount);
        credit(transaction, customerAccount, amount);
    }

    /*
     * =====================================================
     * CASH WITHDRAWAL (BRANCH)
     * =====================================================
     * Customer Account       DEBIT
     * Cash Vault             CREDIT
     */
    public void cashWithdrawal(
            Transaction transaction,
            Account customerAccount,
            Account cashVault,
            BigDecimal amount
    ) {
        debit(transaction, customerAccount, amount);
        credit(transaction, cashVault, amount);
    }

    /*
     * =====================================================
     * FEE CHARGE
     * =====================================================
     * Customer Account       DEBIT
     * Fee Income Account     CREDIT
     *
     * Call this for both chargeAmount and vatAmount if they
     * go to different income accounts.
     */
    public void feeCharge(
            Transaction transaction,
            Account customerAccount,
            Account feeIncomeAccount,
            BigDecimal amount
    ) {
        debit(transaction, customerAccount, amount);
        credit(transaction, feeIncomeAccount, amount);
    }

    /*
     * =====================================================
     * INTEREST POSTING
     * =====================================================
     * Interest Expense       DEBIT
     * Customer Account       CREDIT
     */
    public void interestPosting(
            Transaction transaction,
            Account interestExpenseAccount,
            Account customerAccount,
            BigDecimal amount
    ) {
        debit(transaction, interestExpenseAccount, amount);
        credit(transaction, customerAccount, amount);
    }

    /*
     * =====================================================
     * LOAN DISBURSEMENT
     * =====================================================
     * Loan Control Account   DEBIT  (asset increases)
     * Customer Account       CREDIT (funds delivered)
     */
    public void loanDisbursement(
            Transaction transaction,
            Account loanControlAccount,
            Account customerAccount,
            BigDecimal amount
    ) {
        debit(transaction, loanControlAccount, amount);
        credit(transaction, customerAccount, amount);
    }

    /*
     * =====================================================
     * LOAN REPAYMENT
     * =====================================================
     * Customer Account       DEBIT  (funds leave customer)
     * Loan Control Account   CREDIT (asset decreases)
     */
    public void loanRepayment(
            Transaction transaction,
            Account customerAccount,
            Account loanControlAccount,
            BigDecimal amount
    ) {
        debit(transaction, customerAccount, amount);
        credit(transaction, loanControlAccount, amount);
    }

    /*
     * =====================================================
     * CARD / POS PURCHASE  (hold-settle flow)
     * =====================================================
     * Step 1 — holdAmount    : reserve funds at auth time (no ledger entry yet)
     * Step 2 — settleCardPurchase : post actual debit when merchant settles
     *
     * Customer Account       DEBIT  (settled amount)
     * Merchant/CardController Account  CREDIT
     */
    public void settleCardPurchase(
            Transaction transaction,
            Account customerAccount,
            Account merchantSettlementAccount,
            BigDecimal heldAmount,   // amount previously on hold
            BigDecimal settledAmount // actual settled amount (may differ from hold)
    ) {
        // Release the original hold before posting actual debit
        releaseHold(customerAccount, heldAmount);

        debit(transaction, customerAccount, settledAmount);
        credit(transaction, merchantSettlementAccount, settledAmount);
    }

    /*
     * =====================================================
     * HOLD BALANCE
     * =====================================================
     * CardController Purchase / POS / Pending Transaction
     * availableBalance ↓  holdBalance ↑  (currentBalance unchanged)
     */
    public void holdAmount(Account account, BigDecimal amount) {

        account.setAvailableBalance(account.getAvailableBalance().subtract(amount));
        account.setHoldBalance(account.getHoldBalance().add(amount));
    }

    /*
     * =====================================================
     * RELEASE HOLD BALANCE
     * =====================================================
     * Reversal of auth / expired hold
     * availableBalance ↑  holdBalance ↓
     */
    public void releaseHold(Account account, BigDecimal amount) {

        account.setAvailableBalance(account.getAvailableBalance().add(amount));
        account.setHoldBalance(account.getHoldBalance().subtract(amount));
    }

    /*
     * =====================================================
     * REVERSAL
     * =====================================================
     * Post an opposite entry to undo a previous posting.
     * The original Transaction should be marked REVERSED;
     * a new reversal Transaction should reference it.
     */
    public void reverseDebit(
            Transaction reversalTransaction,
            Account account,
            BigDecimal amount
    ) {
        credit(reversalTransaction, account, amount);
    }

    public void reverseCredit(
            Transaction reversalTransaction,
            Account account,
            BigDecimal amount
    ) {
        debit(reversalTransaction, account, amount);
    }

    /*
     * =====================================================
     * INTERNAL — CREATE TRANSACTION ENTRY
     * =====================================================
     */
    private void addEntry(
            Transaction transaction,
            Account account,
            EntryType entryType,
            BigDecimal amount
    ) {
        TransactionEntry entry = new TransactionEntry();
        entry.setTransaction(transaction);
        entry.setAccount(account);
        entry.setEntryType(entryType);
        entry.setAmount(amount);
        // Snapshot balance for audit trail
        entry.setBalanceAfter(account.getCurrentBalance());

        transaction.getTransactionEntries().add(entry);
    }
}
