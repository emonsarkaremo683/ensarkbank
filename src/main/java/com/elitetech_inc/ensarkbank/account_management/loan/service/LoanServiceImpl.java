package com.elitetech_inc.ensarkbank.account_management.loan.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationRequest;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanApplicationResponse;
import com.elitetech_inc.ensarkbank.account_management.loan.dto.LoanMapper;
import com.elitetech_inc.ensarkbank.account_management.loan.entity.Loan;
import com.elitetech_inc.ensarkbank.account_management.loan.entity.LoanRepayment;
import com.elitetech_inc.ensarkbank.account_management.loan.repository.LoanRepaymentRepository;
import com.elitetech_inc.ensarkbank.account_management.loan.repository.LoanRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionService;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.enums.LoanStatus;
import com.elitetech_inc.ensarkbank.common.enums.RepaymentStatus;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService{

    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository repaymentRepository;
    private final AccountRepository accountRepository;
    private final TransactionService transactionService;
    private final LoanMapper loanMapper;
    private final BranchRepository branchRepository;

    private static final int SCALE = 2;
    private static final RoundingMode RM = RoundingMode.HALF_UP;


    @Override
    public LoanApplicationResponse applyLoan(LoanApplicationRequest lar) {
        if (lar.getPrincipalAmount().compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Principal must be positive");
        if (lar.getTenureMonths() <= 0)
            throw new IllegalArgumentException("Tenure must be positive");


        BigDecimal emi = calculateEMI(lar.getPrincipalAmount(), lar.getAnnualInterestRate(), lar.getTenureMonths());
        BigDecimal totalPayable = emi.multiply(BigDecimal.valueOf(lar.getTenureMonths())).setScale(SCALE, RM);

        Account account = accountRepository.findById(lar.getAccountId()).orElse(null);

        Loan loan = new Loan();
        loan.setAccount(account);
        loan.setPrincipalAmount(lar.getPrincipalAmount().setScale(SCALE, RM));
        loan.setAnnualInterestRate(lar.getAnnualInterestRate().setScale(2, RM));
        loan.setTenureMonths(lar.getTenureMonths());
        loan.setEmiAmount(emi);
        loan.setOutstandingBalance(lar.getPrincipalAmount().setScale(SCALE, RM));
        loan.setTotalPayable(totalPayable);
        loan.setStatus(LoanStatus.PENDING);

        Loan savedLoan = loanRepository.save(loan);

        return loanMapper.toResponse(savedLoan);
    }

    @Override
    public LoanApplicationResponse approve(Long loanId) {
        Loan loan = getLoanOrThrow(loanId);
        requireStatus(loan, LoanStatus.PENDING);
        loan.setStatus(LoanStatus.APPROVED);
        loan.setApprovalDate(LocalDate.now());
        return loanMapper.toResponse(loanRepository.save(loan));
    }

    @Override
    public LoanApplicationResponse reject(Long loanId, String reason) {
        Loan loan = getLoanOrThrow(loanId);
        requireStatus(loan, LoanStatus.PENDING);
        loan.setStatus(LoanStatus.REJECTED);
        loan.setRejectionReason(reason);
        return loanMapper.toResponse(loanRepository.save(loan));
    }

    @Override
    public LoanApplicationResponse disburse(Long loanId) {
        Loan loan = getLoanOrThrow(loanId);
        requireStatus(loan, LoanStatus.APPROVED);

        Account loanControlAccount = getAccountOrThrow(loan);

        TransactionRequest request = new TransactionRequest();
        request.setAmount(loan.getPrincipalAmount());
        request.setTransactionType(TransactionType.LOAN_DISBURSEMENT);
        request.setRemarks("Loan disbursement - Loan #" + loan.getId());
        request.setChannel(TransactionChannel.INTERNET_BANKING);

        TransactionResponse response = transactionService.loanDisbursement(request, loanControlAccount, loan.getAccount());

        loan.setStatus(LoanStatus.DISBURSED);
        loan.setDisbursementDate(LocalDate.now());
        loan.setDisbursementTransactionRef(response.getTransactionId());
        loanRepository.save(loan);

        generateRepaymentSchedule(loan);

        loan.setStatus(LoanStatus.ACTIVE);
        loan.setNextDueDate(loan.getRepayments().getFirst().getDueDate());
        return loanMapper.toResponse(loanRepository.save(loan));
    }

    @Override
    public List<LoanApplicationResponse> getLoansByAccount(Long accountId) {
        return loanRepository.findByAccountId(accountId)
                .stream()
                .map(loanMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanApplicationResponse> getLoans() {
        return loanRepository.findAll()
                .stream()
                .map(loanMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LoanApplicationResponse getLoanById(Long loanId) {
        Loan loan = getLoanOrThrow(loanId);
        return loanMapper.toResponse(loan);
    }




    @Transactional
    public LoanRepayment payInstallment(Long loanRepaymentId) {
        LoanRepayment repayment = repaymentRepository.findById(loanRepaymentId)
                .orElseThrow(() -> new IllegalArgumentException("Repayment not found: " + loanRepaymentId));

        if (repayment.getStatus() == RepaymentStatus.PAID || repayment.getStatus() == RepaymentStatus.LATE)
            throw new IllegalStateException("Installment already paid");

        Loan loan = repayment.getLoan();

        Account loanControlAccount = getAccountOrThrow(loan);

        TransactionRequest request = new TransactionRequest();
        request.setAmount(repayment.getEmiAmount());
        request.setRemarks("EMI payment - Loan #" + loan.getId() + " Installment #" + repayment.getInstallmentNumber());
        request.setChannel(TransactionChannel.INTERNET_BANKING);

        TransactionResponse response = transactionService.loanRepayment(request, loan.getAccount(), loanControlAccount);

        repayment.setStatus(repayment.getDueDate().isBefore(LocalDate.now())
                ? RepaymentStatus.LATE
                : RepaymentStatus.PAID);
        repayment.setPaidDate(LocalDate.now());
        repayment.setTransactionRef(response.getTransactionId());
        repaymentRepository.save(repayment);

        loan.setOutstandingBalance(repayment.getRemainingBalanceAfter());

        List<LoanRepayment> schedule = repaymentRepository.findByLoanIdOrderByInstallmentNumberAsc(loan.getId());
        boolean allSettled = schedule.stream()
                .allMatch(r -> r.getStatus() == RepaymentStatus.PAID || r.getStatus() == RepaymentStatus.LATE);

        if (allSettled) {
            loan.setStatus(LoanStatus.CLOSED);
        } else {
            schedule.stream()
                    .filter(r -> r.getStatus() == RepaymentStatus.PENDING)
                    .findFirst()
                    .ifPresent(next -> loan.setNextDueDate(next.getDueDate()));
        }
        loanRepository.save(loan);

        return repayment;
    }



    private void generateRepaymentSchedule(Loan loan) {
        BigDecimal balance = loan.getPrincipalAmount();
        BigDecimal monthlyRate = loan.getAnnualInterestRate()
                .divide(BigDecimal.valueOf(1200), MathContext.DECIMAL64);

        LocalDate dueDate = loan.getDisbursementDate().plusMonths(1);

        for (int i = 1; i <= loan.getTenureMonths(); i++) {
            BigDecimal interest = balance.multiply(monthlyRate).setScale(SCALE, RM);
            BigDecimal principalComponent = loan.getEmiAmount().subtract(interest).setScale(SCALE, RM);

            if (i == loan.getTenureMonths()) {
                principalComponent = balance; // absorb rounding remainder
            }

            balance = balance.subtract(principalComponent).setScale(SCALE, RM);
            if (balance.compareTo(BigDecimal.ZERO) < 0) balance = BigDecimal.ZERO;

            LoanRepayment repayment = new LoanRepayment();
            repayment.setLoan(loan);
            repayment.setInstallmentNumber(i);
            repayment.setDueDate(dueDate);
            repayment.setPrincipalComponent(principalComponent);
            repayment.setInterestComponent(interest);
            repayment.setEmiAmount(i == loan.getTenureMonths()
                    ? principalComponent.add(interest).setScale(SCALE, RM)
                    : loan.getEmiAmount());
            repayment.setRemainingBalanceAfter(balance);
            repayment.setStatus(RepaymentStatus.PENDING);

            repaymentRepository.save(repayment);
            loan.getRepayments().add(repayment);
            dueDate = dueDate.plusMonths(1);
        }
    }



    public BigDecimal calculateEMI(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), SCALE, RM);
        }
        BigDecimal r = annualRate.divide(BigDecimal.valueOf(1200), MathContext.DECIMAL64);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal onePlusRPowN = onePlusR.pow(tenureMonths, MathContext.DECIMAL64);

        BigDecimal numerator = principal.multiply(r).multiply(onePlusRPowN);
        BigDecimal denominator = onePlusRPowN.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, SCALE, RM);
    }

    private Loan getLoanOrThrow(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + id));
    }

    private void requireStatus(Loan loan, LoanStatus expected) {
        if (loan.getStatus() != expected)
            throw new IllegalStateException("Loan must be in " + expected + " state, was " + loan.getStatus());
    }


    private Account getAccountOrThrow(Loan loan) {
        Branch b = branchRepository.findById(loan.getAccount().getBranch().getId()).orElse(null);

        if(b == null) throw new IllegalArgumentException("Branch not found");

        return accountRepository.findAccountByAccountNumber("br-" + b.getRoutingNumber())
                .orElseThrow(() -> new IllegalStateException("Loan control GL account not configured"));

    }



}
