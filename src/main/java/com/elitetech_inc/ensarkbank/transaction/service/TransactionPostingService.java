package com.elitetech_inc.ensarkbank.transaction.service;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.EntryType;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.transaction.entity.TransactionEntry;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class TransactionPostingService {

    /*
     * =====================================================
     * CREDIT POSTING
     * =====================================================
     *
     * Deposit
     * Interest Posting
     * Refund
     * Inward Transfer
     *
     * Account Balance Increase
     *
     */
    public void credit(
            Transaction transaction,
            Account account,
            double amount
    ) {

        account.setAvailableBalance(
                account.getAvailableBalance() + amount
        );

        account.setCurrentBalance(
                account.getCurrentBalance() + amount
        );

        addEntry(
                transaction,
                account,
                EntryType.CREDIT,
                amount
        );
    }

    /*
     * =====================================================
     * DEBIT POSTING
     * =====================================================
     *
     * Withdrawal
     * ATM Withdrawal
     * Fee Charge
     * Penalty
     * Loan Repayment
     *
     * Account Balance Decrease
     *
     */
    public void debit(
            Transaction transaction,
            Account account,
            double amount
    ) {

        account.setAvailableBalance(
                account.getAvailableBalance() - amount
        );

        account.setCurrentBalance(
                account.getCurrentBalance() - amount
        );

        addEntry(
                transaction,
                account,
                EntryType.DEBIT,
                amount
        );
    }

    /*
     * =====================================================
     * INTERNAL ACCOUNT TRANSFER
     * =====================================================
     *
     * Same Bank Transfer
     *
     * Customer A -> Customer B
     *
     */
    public void transfer(
            Transaction transaction,
            Account sender,
            Account receiver,
            double amount
    ) {

        debit(transaction, sender, amount);

        credit(transaction, receiver, amount);
    }

    /*
     * =====================================================
     * OUTWARD BANK TRANSFER
     * =====================================================
     *
     * Our Bank -> Other Bank
     *
     * Customer Account       DEBIT
     * Settlement Account     CREDIT
     *
     */
    public void outwardTransfer(
            Transaction transaction,
            Account customerAccount,
            Account settlementAccount,
            double amount
    ) {

        debit(
                transaction,
                customerAccount,
                amount
        );

        credit(
                transaction,
                settlementAccount,
                amount
        );
    }

    /*
     * =====================================================
     * INWARD BANK TRANSFER
     * =====================================================
     *
     * Other Bank -> Our Bank
     *
     * Settlement Account     DEBIT
     * Customer Account       CREDIT
     *
     */
    public void inwardTransfer(
            Transaction transaction,
            Account settlementAccount,
            Account customerAccount,
            double amount
    ) {

        debit(
                transaction,
                settlementAccount,
                amount
        );

        credit(
                transaction,
                customerAccount,
                amount
        );
    }

    /*
     * =====================================================
     * ATM CASH DEPOSIT
     * =====================================================
     *
     * ATM Cash Account       DEBIT
     * Customer Account       CREDIT
     *
     */
    public void atmCashDeposit(
            Transaction transaction,
            Account atmCashAccount,
            Account customerAccount,
            double amount
    ) {

        debit(
                transaction,
                atmCashAccount,
                amount
        );

        credit(
                transaction,
                customerAccount,
                amount
        );
    }

    /*
     * =====================================================
     * ATM WITHDRAWAL
     * =====================================================
     *
     * Customer Account       DEBIT
     * ATM Cash Account       CREDIT
     *
     */
    public void atmWithdrawal(
            Transaction transaction,
            Account customerAccount,
            Account atmCashAccount,
            double amount
    ) {

        debit(
                transaction,
                customerAccount,
                amount
        );

        credit(
                transaction,
                atmCashAccount,
                amount
        );
    }

    /*
     * =====================================================
     * CASH DEPOSIT (BRANCH)
     * =====================================================
     *
     * Cash Vault             DEBIT
     * Customer Account       CREDIT
     *
     */
    public void cashDeposit(
            Transaction transaction,
            Account cashVault,
            Account customerAccount,
            double amount
    ) {

        debit(
                transaction,
                cashVault,
                amount
        );

        credit(
                transaction,
                customerAccount,
                amount
        );
    }

    /*
     * =====================================================
     * CASH WITHDRAWAL (BRANCH)
     * =====================================================
     *
     * Customer Account       DEBIT
     * Cash Vault             CREDIT
     *
     */
    public void cashWithdrawal(
            Transaction transaction,
            Account customerAccount,
            Account cashVault,
            double amount
    ) {

        debit(
                transaction,
                customerAccount,
                amount
        );

        credit(
                transaction,
                cashVault,
                amount
        );
    }

    /*
     * =====================================================
     * FEE CHARGE
     * =====================================================
     *
     * Customer Account       DEBIT
     * Fee Income Account     CREDIT
     *
     */
    public void feeCharge(
            Transaction transaction,
            Account customerAccount,
            Account feeIncomeAccount,
            double amount
    ) {

        debit(
                transaction,
                customerAccount,
                amount
        );

        credit(
                transaction,
                feeIncomeAccount,
                amount
        );
    }

    /*
     * =====================================================
     * INTEREST POSTING
     * =====================================================
     *
     * Interest Expense       DEBIT
     * Customer Account       CREDIT
     *
     */
    public void interestPosting(
            Transaction transaction,
            Account interestExpenseAccount,
            Account customerAccount,
            double amount
    ) {

        debit(
                transaction,
                interestExpenseAccount,
                amount
        );

        credit(
                transaction,
                customerAccount,
                amount
        );
    }

    /*
     * =====================================================
     * LOAN DISBURSEMENT
     * =====================================================
     *
     * Loan Account           DEBIT
     * Customer Account       CREDIT
     *
     */
    public void loanDisbursement(
            Transaction transaction,
            Account loanAccount,
            Account customerAccount,
            double amount
    ) {

        debit(
                transaction,
                loanAccount,
                amount
        );

        credit(
                transaction,
                customerAccount,
                amount
        );
    }

    /*
     * =====================================================
     * LOAN REPAYMENT
     * =====================================================
     *
     * Customer Account       DEBIT
     * Loan Account           CREDIT
     *
     */
    public void loanRepayment(
            Transaction transaction,
            Account customerAccount,
            Account loanAccount,
            double amount
    ) {

        debit(
                transaction,
                customerAccount,
                amount
        );

        credit(
                transaction,
                loanAccount,
                amount
        );
    }

    /*
     * =====================================================
     * HOLD BALANCE
     * =====================================================
     *
     * Card Purchase
     * POS Transaction
     * Pending Transaction
     *
     */
    public void holdAmount(
            Account account,
            double amount
    ) {

        account.setAvailableBalance(
                account.getAvailableBalance() - amount
        );

        account.setHoldBalance(
                account.getHoldBalance() + amount
        );
    }

    /*
     * =====================================================
     * RELEASE HOLD BALANCE
     * =====================================================
     */
    public void releaseHold(
            Account account,
            double amount
    ) {

        account.setAvailableBalance(
                account.getAvailableBalance() + amount
        );

        account.setHoldBalance(
                account.getHoldBalance() - amount
        );
    }

    /*
     * =====================================================
     * REVERSAL
     * =====================================================
     */
    public void reverseDebit(
            Transaction transaction,
            Account account,
            double amount
    ) {

        credit(
                transaction,
                account,
                amount
        );
    }

    public void reverseCredit(
            Transaction transaction,
            Account account,
            double amount
    ) {

        debit(
                transaction,
                account,
                amount
        );
    }

    /*
     * =====================================================
     * CREATE TRANSACTION ENTRY
     * =====================================================
     */
    private void addEntry(
            Transaction transaction,
            Account account,
            EntryType entryType,
            double amount
    ) {

        TransactionEntry entry = new TransactionEntry();

        entry.setTransaction(transaction);
        entry.setAccount(account);
        entry.setEntryType(entryType);
        entry.setAmount(amount);

        transaction.getTransactionEntries().add(entry);
    }
}