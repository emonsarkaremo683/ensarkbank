package com.elitetech_inc.ensarkbank.util;

import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.common.enums.AccountType;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class Validator {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;


    public void checkKycStatus(Long customerId) {
                 customerRepository.findById(customerId)
                    .map(c -> {
                    if (c.getKyc() == null) {
                        throw new RuntimeException("KYC data is missing for this customer");
                    }

                    String msg = "Kyc verification is " + c.getKyc().getStatus();
                    return switch (c.getKyc().getStatus()) {
                        case PENDING, EXPIRED, UNDER_REVIEW, REJECTED -> throw new RuntimeException(msg);
                        case VERIFIED -> true;
                        default -> throw new RuntimeException("Unknown KYC status: " + c.getKyc().getStatus());
                    };
                })
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
    }

    public void checkAccountStatus(String accountNumber){
                accountRepository.findAccountByAccountNumber(accountNumber)
                .map(a->{
                    String msg = "Account is " + a.getAccountStatus();
                    return switch (a.getAccountStatus()){
                        case ACTIVE -> true;
                        default -> throw new RuntimeException(msg);
                    };
                })
                .orElseThrow(()-> new RuntimeException("Account Not Found"));
    }

    public void checkCardStatus(String cardNumber){
                 cardRepository.findByCardNumber(cardNumber)
                .map(card->{
                    String msg = "Account is " + card.getStatus();
                    return switch (card.getStatus()){
                        case ACTIVE -> true;
                        default -> throw new RuntimeException(msg);
                    };


                })
                .orElseThrow(()-> new RuntimeException("Card Not Found"));
    }

    public boolean checkAccountExists(String accountNumber){
        return accountRepository.existsByAccountNumber(accountNumber);
    }

    private static final Set<AccountType> VAULT_TYPES = Set.of(
            AccountType.BRANCH_VAULT,
            AccountType.AGENT_BANK_VAULT,
            AccountType.ATM_VAULT,
            AccountType.INTER_BANK_VAULT
    );

    public void checkAccountType(String accountNumber) {
        accountRepository.findAccountByAccountNumber(accountNumber)
                .filter(acc -> !VAULT_TYPES.contains(acc.getAccountType()))
                .orElseThrow(()-> new RuntimeException((" Invalid Account")));
    }




}
