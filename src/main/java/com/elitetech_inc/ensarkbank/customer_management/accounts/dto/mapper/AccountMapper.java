package com.elitetech_inc.ensarkbank.customer_management.accounts.dto.mapper;

import com.elitetech_inc.ensarkbank.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.customer_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import com.elitetech_inc.ensarkbank.util.AccountNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountMapper {

    private final AccountNumberGenerator accountNumberGenerator;

    private final BranchRepository branchRepository;

    public AccountResponse toAccountResponse(Account acc) {
        AccountResponse ar = new AccountResponse();
        ar.setAccountNumber(acc.getAccNumber());
        ar.setType(acc.getType());
        ar.setAccountStatus(acc.getAccountStatus());
        ar.setAvailableBalance(acc.getAvailableBalance());
        ar.setCurrentBalance(acc.getCurrentBalance());
        ar.setHoldBalance(acc.getHoldBalance());
        ar.setBranchName(acc.getBranch().getName());

        // for all type customer accounts
        ar.setP_holderType(acc.getHolders().getFirst().getHolderType());
        ar.setP_canDeposit(acc.getHolders().getFirst().getCanDeposit());
        ar.setP_canWithdraw(acc.getHolders().getFirst().getCanWithdraw());
        ar.setP_customer_name(acc.getHolders().getFirst().getCustomer().getName());

        if(acc.getType().equals(AccountType.JOINT_ACCOUNT)
                || acc.getType().equals(AccountType.BUSINESS)
        ) {
            ar.setS_holderType(acc.getHolders().get(1).getHolderType());
            ar.setP_canDeposit(acc.getHolders().get(1).getCanDeposit());
            ar.setP_canWithdraw(acc.getHolders().get(1).getCanWithdraw());
            ar.setP_customer_name(acc.getHolders().get(1).getCustomer().getName());

        }
        if(acc.getType().equals(AccountType.BUSINESS)
        ) {
            ar.setS_holderType(acc.getHolders().get(2).getHolderType());
            ar.setP_canDeposit(acc.getHolders().get(2).getCanDeposit());
            ar.setP_canWithdraw(acc.getHolders().get(2).getCanWithdraw());
            ar.setP_customer_name(acc.getHolders().get(2).getCustomer().getName());

        }


        return ar;
    }

    public  Account toAccount(AccountRequest ar) {
        Account acc = new Account();
        acc.setAccNumber(accountNumberGenerator.accountNumberGenerate(ar));
        acc.setType(ar.getType());
        acc.setAccountStatus(ar.getAccountStatus());
        acc.setAvailableBalance(ar.getBalance());
        acc.setCurrentBalance(ar.getBalance());
        acc.setHoldBalance(ar.getBalance());
        acc.setBranch(ar.getBranch());
        return acc;
    }

    public AccountHolder toPrimaryAccountHolder(AccountRequest ar, Account acc) {
        AccountHolder p = new AccountHolder();
        p.setHolderType(ar.getP_holderType());
        p.setCanDeposit(ar.getP_canDeposit());
        p.setCanWithdraw(ar.getP_canWithdraw());
        p.setCustomer(ar.getP_customer());
        p.setAccount(acc);
        return p;
    }
    public AccountHolder toSecondaryAccountHolder(AccountRequest ar, Account acc) {
        AccountHolder p = new AccountHolder();
        p.setHolderType(ar.getS_holderType());
        p.setCanDeposit(ar.getS_canDeposit());
        p.setCanWithdraw(ar.getS_canWithdraw());
        p.setCustomer(ar.getS_customer());
        p.setAccount(acc);
        return p;
    }

    public AccountHolder toOtherAccountHolder(AccountRequest ar, Account acc) {
        AccountHolder p = new AccountHolder();
        p.setHolderType(ar.getO_holderType());
        p.setCanDeposit(ar.getO_canDeposit());
        p.setCanWithdraw(ar.getO_canWithdraw());
        p.setCustomer(ar.getO_customer());
        p.setAccount(acc);
        return p;
    }




}
