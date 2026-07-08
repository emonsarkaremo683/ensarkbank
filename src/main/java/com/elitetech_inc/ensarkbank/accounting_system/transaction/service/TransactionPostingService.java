package com.elitetech_inc.ensarkbank.accounting_system.transaction.service;

import java.math.BigDecimal;

import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.Journal;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.common.enums.EntryType;

@Service
@Transactional
@RequiredArgsConstructor
public class TransactionPostingService {

    private final AccountRepository accountRepository;


    /*
     * =====================================================
     * CREDIT POSTING
     * =====================================================
     * Use cases: Deposit, Interest Posting, Refund, Inward Transfer
     * Effect: availableBalance ↑  currentBalance ↑
     */
    public void credit(Transaction transaction, String acc, BigDecimal amount) {
        if (transaction == null || acc == null) {
            throw new IllegalArgumentException("Transaction and account are required");
        }
        BigDecimal normalizedAmount = normalizeAmount(amount);
        if (accountRepository.existsByAccountNumber(acc)){
            Account account = accountRepository.findAccountByAccountNumber(acc).orElseThrow(
                    ()-> new RuntimeException("Account not found")
            );
            account.setAvailableBalance(zeroIfNull(account.getAvailableBalance()).add(normalizedAmount));
            account.setCurrentBalance(zeroIfNull(account.getCurrentBalance()).add(normalizedAmount));
        }

        addEntry(transaction, acc, EntryType.CREDIT, normalizedAmount);
    }

    /*
     * =====================================================
     * DEBIT POSTING
     * =====================================================
     * Use cases: Withdrawal, ATM, Fee, Penalty, Loan Repayment
     * Effect: availableBalance ↓  currentBalance ↓
     */
    public void debit(Transaction transaction, String acc, BigDecimal amount) {
        if (transaction == null || acc == null) {
            throw new IllegalArgumentException("Transaction and account are required");
        }

        BigDecimal normalizedAmount = normalizeAmount(amount);
        if (accountRepository.existsByAccountNumber(acc)){
            Account account = accountRepository.findAccountByAccountNumber(acc).orElseThrow(
                    ()-> new RuntimeException("Account not found")
            );

            BigDecimal availableBalance = zeroIfNull(account.getAvailableBalance());
            if (availableBalance.compareTo(normalizedAmount) < 0) {
                throw new IllegalArgumentException("Insufficient balance for transaction");
            }

            account.setAvailableBalance(availableBalance.subtract(normalizedAmount));
            account.setCurrentBalance(zeroIfNull(account.getCurrentBalance()).subtract(normalizedAmount));
        }

        addEntry(transaction, acc, EntryType.DEBIT, normalizedAmount);
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
            String sender,
            String receiver,
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
            String customerAccount,
            String settlementAccount,
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
            String settlementAccount,
            String customerAccount,
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
            String atmCashAccount,
            String customerAccount,
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
            String customerAccount,
            String atmCashAccount,
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
            String cashVault,
            String customerAccount,
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
            String customerAccount,
            String cashVault,
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
            String customerAccount,
            String feeIncomeAccount,
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
            String interestExpenseAccount,
            String customerAccount,
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
            String loanControlAccount,
            String customerAccount,
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
            String customerAccount,
            String loanControlAccount,
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
            String customerAccount,
            String merchantSettlementAccount,
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
    public void releaseHold(String acc, BigDecimal amount) {

        Account account = accountRepository.findAccountByAccountNumber(acc).orElseThrow(
                ()-> new RuntimeException("Account not found")
        );

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
            String account,
            BigDecimal amount
    ) {
        credit(reversalTransaction, account, amount);
    }

    public void reverseCredit(
            Transaction reversalTransaction,
            String account,
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
            String account,
            EntryType entryType,
            BigDecimal amount
    ) {
        Journal entry = new Journal();
        Account acc = accountRepository.findAccountByAccountNumber(account).orElse(null);
        entry.setAccount(acc);
        entry.setTransaction(transaction);
        entry.setAccountNumber(account);
        entry.setEntryType(entryType);
        entry.setAmount(amount);

        transaction.getEntries().add(entry);
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive");
        }
        return amount;
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
