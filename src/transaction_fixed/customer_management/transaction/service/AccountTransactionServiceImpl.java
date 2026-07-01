package com.elitetech_inc.ensarkbank.customer_management.transaction.service;

import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.customer_management.transaction.dto.mapper.AccountTransactionMapper;
import com.elitetech_inc.ensarkbank.customer_management.transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.customer_management.transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.customer_management.transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.customer_management.transaction.repository.AccountTransactionRepository;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.transaction.service.TransactionPostingService;
import com.elitetech_inc.ensarkbank.transaction.service.ValidationService;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountTransactionServiceImpl implements AccountTransactionService {

    private final AccountTransactionRepository accountTransactionRepository;
    private final TransactionRepository         transactionRepository;
    private final AccountTransactionMapper      accountTransactionMapper;
    private final TransactionPostingService     transactionPostingService;
    private final ValidationService             validationService;
    private final AccountRepository             accountRepository;
    private final Utils                         utils;

    /*
     * =====================================================
     * ENTRY POINT — routes by TransactionType
     * =====================================================
     */
    @Override
    public AccountTransactionResponse createAccountTransaction(AccountTransactionRequest request) {

        return switch (request.getTransactionType()) {

            case DEPOSIT  -> handleDeposit(request);
            case WITHDRAW -> handleWithdraw(request);
            case TRANSFER -> handleTransfer(request);
            case PAYMENT  -> handleOutwardTransfer(request);
            case REFUND   -> handleRefund(request);

            default -> throw new IllegalArgumentException(
                    "Unsupported transaction type for account transactions: "
                    + request.getTransactionType());
        };
    }

    /*
     * =====================================================
     * DEPOSIT  (branch cash-in / internal credit)
     * =====================================================
     * Cash Vault DEBIT | Customer Account CREDIT
     *
     * For branch deposits the cashVaultAccount is the branch's
     * internal cash vault.  The vault account number must be
     * supplied in senderAccountNumber.
     */
    private AccountTransactionResponse handleDeposit(AccountTransactionRequest request) {

        Account cashVault = validationService.validateAccount(request.getSenderAccountNumber());
        Account customerAccount;

        if (request.getReceiverAccountNumber() == null) {
            throw new IllegalArgumentException(
                    "Receiver account number is required for DEPOSIT.");
        }

        customerAccount = validationService.validateAccount(request.getReceiverAccountNumber());

        validationService.validateDeposit(customerAccount, request.getAmount());

        Transaction tx = buildTransaction(request);

        transactionPostingService.cashDeposit(tx, cashVault, customerAccount, request.getAmount());

        return persistAndReturn(tx, request, cashVault, customerAccount.getAccNumber(),
                customerAccount.getId().toString(), null);
    }

    /*
     * =====================================================
     * WITHDRAWAL  (branch cash-out)
     * =====================================================
     * Customer Account DEBIT (amount + charges) | Cash Vault CREDIT (amount)
     * Fee Income CREDIT (chargeAmount) | VAT Income CREDIT (vatAmount)
     */
    private AccountTransactionResponse handleWithdraw(AccountTransactionRequest request) {

        Account customerAccount = validationService.validateAccount(request.getSenderAccountNumber());

        // FIX: validate that account has enough to cover amount + charge + vat
        validationService.validateWithdrawWithCharges(
                customerAccount,
                request.getAmount(),
                request.getChargeAmount(),
                request.getVatAmount()
        );

        Transaction tx = buildTransaction(request);

        // Debit only the core amount to vault — charges handled separately
        // (vault account number stored in receiverAccountNumber for withdrawals)
        String vaultAccNo = request.getReceiverAccountNumber();
        if (vaultAccNo == null) {
            throw new IllegalArgumentException(
                    "Receiver (vault) account number is required for WITHDRAW.");
        }
        Account cashVault = validationService.validateAccount(vaultAccNo);

        transactionPostingService.cashWithdrawal(tx, customerAccount, cashVault, request.getAmount());

        postChargesIfPresent(tx, customerAccount, request);

        return persistAndReturn(tx, request, customerAccount, cashVault.getAccNumber(), null, null);
    }

    /*
     * =====================================================
     * INTERNAL TRANSFER  (same bank)
     * =====================================================
     * Sender DEBIT | Receiver CREDIT
     * Sender also debited for charge + vat if present.
     */
    private AccountTransactionResponse handleTransfer(AccountTransactionRequest request) {

        if (request.getReceiverAccountNumber() == null) {
            throw new IllegalArgumentException(
                    "Receiver account number is required for TRANSFER.");
        }

        Account sender   = validationService.validateAccount(request.getSenderAccountNumber());
        Account receiver = validationService.validateAccount(request.getReceiverAccountNumber());

        validationService.validateTransferWithCharges(
                sender, receiver,
                request.getAmount(),
                request.getChargeAmount(),
                request.getVatAmount()
        );

        Transaction tx = buildTransaction(request);

        transactionPostingService.transfer(tx, sender, receiver, request.getAmount());

        postChargesIfPresent(tx, sender, request);

        return persistAndReturn(
                tx, request, sender,
                receiver.getAccNumber(),
                request.getReceiverName(),
                "Ensark Bank"
        );
    }

    /*
     * =====================================================
     * OUTWARD TRANSFER / PAYMENT  (to another bank)
     * =====================================================
     * Customer Account DEBIT | Settlement Account CREDIT
     *
     * receiverAccountNumber = settlement (nostro) account of our bank.
     * receiverBankName      = destination bank name (stored as snapshot).
     */
    private AccountTransactionResponse handleOutwardTransfer(AccountTransactionRequest request) {

        if (request.getReceiverAccountNumber() == null) {
            throw new IllegalArgumentException(
                    "Settlement account number is required for PAYMENT/OUTWARD_TRANSFER.");
        }

        Account customerAccount   = validationService.validateAccount(request.getSenderAccountNumber());
        Account settlementAccount = validationService.validateAccount(request.getReceiverAccountNumber());

        validationService.validateTransferWithCharges(
                customerAccount, settlementAccount,
                request.getAmount(),
                request.getChargeAmount(),
                request.getVatAmount()
        );

        Transaction tx = buildTransaction(request);

        transactionPostingService.outwardTransfer(tx, customerAccount, settlementAccount, request.getAmount());

        postChargesIfPresent(tx, customerAccount, request);

        return persistAndReturn(
                tx, request, customerAccount,
                request.getReceiverAccountNumber(),
                request.getReceiverName(),
                request.getReceiverBankName()
        );
    }

    /*
     * =====================================================
     * REFUND
     * =====================================================
     * Reversal of a debit: credits the sender's account back.
     * senderAccountNumber = account to be refunded (CREDIT).
     * receiverAccountNumber = source account being reversed (DEBIT).
     */
    private AccountTransactionResponse handleRefund(AccountTransactionRequest request) {

        if (request.getReceiverAccountNumber() == null) {
            throw new IllegalArgumentException(
                    "Source account (to reverse) is required for REFUND.");
        }

        Account accountToRefund = validationService.validateAccount(request.getSenderAccountNumber());
        Account sourceAccount   = validationService.validateAccount(request.getReceiverAccountNumber());

        validationService.validateAccountStatus(accountToRefund);
        validationService.validateAmount(request.getAmount());

        Transaction tx = buildTransaction(request);

        // Refund: source DEBIT → refunded account CREDIT
        transactionPostingService.reverseCredit(tx, sourceAccount, request.getAmount());
        transactionPostingService.reverseDebit(tx, accountToRefund, request.getAmount());

        return persistAndReturn(
                tx, request, sourceAccount,
                accountToRefund.getAccNumber(),
                null, null
        );
    }

    /*
     * =====================================================
     * HELPERS
     * =====================================================
     */

    private Transaction buildTransaction(AccountTransactionRequest request) {

        String ref = utils.generateReference();
        validationService.validateReference(ref);

        Transaction tx = accountTransactionMapper.toTransaction(request);
        tx.setReferenceNo(ref);
        tx.setStatus(TransactionStatus.SUCCESS);

        return tx;
    }

    /**
     * If chargeAmount or vatAmount are present, post them as separate debit entries
     * from the customer's account to the appropriate income accounts.
     *
     * NOTE: fee income account numbers should come from a system configuration.
     * For now we accept them as system-configured constants or inject via properties.
     * Replace FEE_INCOME_ACC and VAT_INCOME_ACC with your actual account numbers.
     */
    private static final String FEE_INCOME_ACC = "FEE-INCOME-001";
    private static final String VAT_INCOME_ACC  = "VAT-INCOME-001";

    private void postChargesIfPresent(Transaction tx, Account payer, AccountTransactionRequest request) {

        BigDecimal charge = request.getChargeAmount();
        BigDecimal vat    = request.getVatAmount();

        if (charge != null && charge.compareTo(BigDecimal.ZERO) > 0) {
            Account feeAccount = accountRepository.findByAccNumber(FEE_INCOME_ACC)
                    .orElseThrow(() -> new IllegalStateException("Fee income account not configured."));
            transactionPostingService.feeCharge(tx, payer, feeAccount, charge);
        }

        if (vat != null && vat.compareTo(BigDecimal.ZERO) > 0) {
            Account vatAccount = accountRepository.findByAccNumber(VAT_INCOME_ACC)
                    .orElseThrow(() -> new IllegalStateException("VAT income account not configured."));
            transactionPostingService.feeCharge(tx, payer, vatAccount, vat);
        }
    }

    private AccountTransactionResponse persistAndReturn(
            Transaction tx,
            AccountTransactionRequest request,
            Account sender,
            String receiverAccountNumber,
            String receiverName,
            String receiverBankName
    ) {
        transactionRepository.save(tx);

        AccountTransaction accountTx = new AccountTransaction();
        accountTx.setTransaction(tx);
        accountTx.setSender(sender);
        accountTx.setAccountNumber(receiverAccountNumber);
        accountTx.setName(receiverName);
        accountTx.setBankName(receiverBankName);

        accountTransactionRepository.save(accountTx);

        // Save mutated accounts (JPA dirty-check handles it within @Transactional,
        // but explicit save is safer if accounts were fetched outside the session)
        accountRepository.save(sender);

        return accountTransactionMapper.toAccountTransactionResponse(accountTx);
    }
}
