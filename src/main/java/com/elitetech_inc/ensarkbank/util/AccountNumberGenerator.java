package com.elitetech_inc.ensarkbank.util;


import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import com.elitetech_inc.ensarkbank.transaction.service.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@RequiredArgsConstructor
public class AccountNumberGenerator {
    private final ValidationService validationService;

    public String accountNumberGenerate(AccountRequest ar) {
        final String acc = "683";
        String branchPart = String.format("%03d", ar.getBranch().getId());
        String randomPart = String.format("%04d",
                new Random().nextInt(10000));
        String accountTypePart = getAccountTypeIdentity(ar.getType());
        String accNumber = acc + "-"+ branchPart +"-"+ accountTypePart + "-"+ randomPart;

        if(validationService.validateAccount(accNumber).getAccNumber().equals(accNumber)){
            accountNumberGenerate(ar);
        }
        return accNumber;
    }

    private String getAccountTypeIdentity(AccountType type){
        String number = "";
        switch (type){
            case SAVINGS:
                number = "01";
                break;
            case CURRENT:
                number = "02";
                break;
            case FIXED_DEPOSIT:
                number = "03";
                break;

            case JOINT_ACCOUNT:
                number = "04";
                break;

            case STUDENT:
                number = "05";
                break;

            case BUSINESS:
                number = "06";
                break;

            default:
                number = "00";
                break;
        };
        return number;
    }

}
