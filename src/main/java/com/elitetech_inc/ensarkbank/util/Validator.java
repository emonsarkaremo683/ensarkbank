package com.elitetech_inc.ensarkbank.util;

import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.card.repository.CardRepository;
import com.elitetech_inc.ensarkbank.common.enums.KYCStatus;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Validator {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;


    public boolean checkKycStatus(Long customerId) {
        return customerRepository.findById(customerId)
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

    public boolean checkAccountStatus(String accountNumber){
        return accountRepository.findAccountByAccountNumber(accountNumber)
                .map(a->{
                    String msg = "Account is " + a.getAccountStatus();
                    return switch (a.getAccountStatus()){
                        case PENDING, BLOCKED, CLOSED, FREEZE, INACTIVE -> throw new RuntimeException(msg);
                        case ACTIVE -> true;
                        default -> throw new RuntimeException(msg);
                    };
                })
                .orElseThrow(()-> new RuntimeException("Account Not Found"));
    }

    public boolean checkCardStatus(String cardNumber){
        return cardRepository.findByCardNumber(cardNumber)
                .map(card->{
                    String msg = "Account is " + card.getStatus();
                    return switch (card.getStatus()){
                        case PENDING, BLOCKED, DISABLED, EXPIRED -> throw new RuntimeException(msg);
                        case ACTIVE -> true;
                        default -> throw new RuntimeException(msg);
                    };


                })
                .orElseThrow(()-> new RuntimeException("Card Not Found"));
    }

}
