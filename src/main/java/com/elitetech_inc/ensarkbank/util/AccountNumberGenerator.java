package com.elitetech_inc.ensarkbank.util;


import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class AccountNumberGenerator {

//    public String accountNumberGenerate(AccountRequest ar) {
//        final String acc = "683";
//        String branchPart = String.format("%03d", ar.getBranch().getId());
//        String randomPart = String.format("%04d",
//                new Random().nextInt(10000));
//        String accountTypePart = getAccountTypeIdentity(ar.getAccountType());
//        String accNumber = acc + "-"+ branchPart +"-"+ accountTypePart + "-"+ randomPart;
//        return accNumber;
//    }
//
//    private String getAccountTypeIdentity(AccountType type){
//        String number = "";
//        switch (type){
//            case SAVINGS:
//                number = "01";
//                break;
//            case CURRENT:
//                number = "02";
//                break;
//            case FIXED_DEPOSIT:
//                number = "03";
//                break;
//
//            case JOINT_ACCOUNT:
//                number = "04";
//                break;
//
//            case STUDENT:
//                number = "05";
//                break;
//
//            case BUSINESS:
//                number = "06";
//                break;
//
//            default:
//                number = "00";
//                break;
//        };
//        return number;
//    }

}
