package com.elitetech_inc.ensarkbank.account_management.account.dto.mapper;

import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.mapper.AccountHolderMapper;
import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.response.AccountHolderResponse;
import com.elitetech_inc.ensarkbank.account_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.account_management.nominee.entity.Nominee;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.address.address.dto.response.AddressResponse;
import com.elitetech_inc.ensarkbank.common.enums.HolderType;
import com.elitetech_inc.ensarkbank.util.AccountNumberGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AccountMapper {

    private final AccountHolderMapper accountHolderMapper;
    private final AccountNumberGenerator  accountNumberGenerator;
    private final BranchRepository branchRepository;

    public AccountResponse toAccountResponse(Account acc) {
        AccountResponse ar = new AccountResponse();
        ar.setId(acc.getId());
        ar.setAccountNumber(acc.getAccountNumber());
        ar.setAccountType(acc.getAccountType());
        ar.setAccountStatus(acc.getAccountStatus());
        ar.setAvailableBalance(acc.getAvailableBalance());
        ar.setCurrentBalance(acc.getCurrentBalance());
        ar.setHoldBalance(acc.getHoldBalance());
        ar.setBranchName(acc.getBranch() != null ? acc.getBranch().getName() : "");
        ar.setBranchRoutingNumber(acc.getBranch() != null ? acc.getBranch().getRoutingNumber() : "");

        // Account Holder Response
        List<AccountHolderResponse> holders = acc.getHolders()
                .stream()
                .map(accountHolderMapper::toAccountHolderResponse)
                .toList();

        ar.setHolderResponses(holders);

        return ar;
    }

    @Transactional
    public Account toAccount(AccountRequest ar) {
        Account acc = new Account();
        acc.setAccountNumber("acc-"+accountNumberGenerator.generateAccountNumber(ar.getBranchId(), ar.getAccountType()));
        acc.setAccountType(ar.getAccountType());
        acc.setAvailableBalance(ar.getAvailableBalance());
        acc.setCurrentBalance(ar.getAvailableBalance());
        acc.setHoldBalance(ar.getAvailableBalance());
        acc.setBranch(branchRepository.findById(ar.getBranchId()).orElse(null));

        return acc;
    }


    public Nominee toNominee(AccountRequest ar){
        return Nominee.builder()
                .name(ar.getN_name())
                .email(ar.getN_email())
                .phone(ar.getN_phone())
                .relation(ar.getRelation())
                .build();
    }



}
