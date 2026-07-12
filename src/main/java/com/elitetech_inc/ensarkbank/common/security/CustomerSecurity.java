package com.elitetech_inc.ensarkbank.common.security;

import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.repository.AccountTransactionRepository;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.repository.TransactionOtpRepository;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.account_management.loan.repository.LoanRepaymentRepository;
import com.elitetech_inc.ensarkbank.account_management.loan.repository.LoanRepository;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.repository.BeneficiaryRepository;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("customerSecurity")
@RequiredArgsConstructor
public class CustomerSecurity {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    private final TransactionOtpRepository transactionOtpRepository;

    private Optional<Long> resolveCustomerId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails)) {
            return Optional.empty();
        }
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return customerRepository.findByUserEmail(email).map(Customer::getId);
    }

    public Long getAuthenticatedCustomerId(Authentication auth) {
        return resolveCustomerId(auth).orElse(null);
    }

    public boolean isOwner(Long accountId, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || accountId == null) return false;
        return accountRepository.existsByAccountIdAndCustomerId(accountId, customerId.get());
    }

    public boolean isAccountNumberOwner(String accountNumber, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || accountNumber == null) return false;
        return accountRepository.existsByAccountNumberAndCustomerId(accountNumber, customerId.get());
    }

    public boolean isCardOwner(Long cardId, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || cardId == null) return false;
        return cardRepository.existsByCardIdAndCustomerId(cardId, customerId.get());
    }

    public boolean isBeneficiaryOwner(Long beneficiaryId, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || beneficiaryId == null) return false;
        return beneficiaryRepository.existsByCustomerIdAndId(customerId.get(), beneficiaryId);
    }

    public boolean isLoanOwner(Long loanId, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || loanId == null) return false;
        return loanRepository.existsByLoanIdAndCustomerId(loanId, customerId.get());
    }

    public boolean isLoanRepaymentOwner(Long repaymentId, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || repaymentId == null) return false;
        return loanRepaymentRepository.existsByRepaymentIdAndCustomerId(repaymentId, customerId.get());
    }

    public boolean isCustomerIdsMatch(Long customerId, Authentication auth) {
        Optional<Long> authCustomerId = resolveCustomerId(auth);
        if (authCustomerId.isEmpty() || customerId == null) return false;
        return authCustomerId.get().equals(customerId);
    }

    public boolean isAccountTransactionOwner(Long transactionId, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || transactionId == null) return false;
        return accountTransactionRepository.existsByTransactionIdAndCustomerId(transactionId, customerId.get());
    }

    public boolean isOtpOwner(Long otpId, Authentication auth) {
        Optional<Long> customerId = resolveCustomerId(auth);
        if (customerId.isEmpty() || otpId == null) return false;
        return transactionOtpRepository.existsByOtpIdAndCustomerId(otpId, customerId.get());
    }
}
