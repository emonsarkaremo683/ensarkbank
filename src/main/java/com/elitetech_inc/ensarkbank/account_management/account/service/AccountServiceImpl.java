package com.elitetech_inc.ensarkbank.account_management.account.service;

import com.elitetech_inc.ensarkbank.account_management.account.dto.mapper.AccountMapper;
import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.mapper.AccountHolderMapper;
import com.elitetech_inc.ensarkbank.account_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final AccountHolderMapper accountHolderMapper;

    @Transactional(readOnly = true)
    @Override
    public AccountResponse createAccount(AccountRequest ar) {

        Account account = accountMapper.toAccount(ar);

        // Set Account Holders
        List<AccountHolder> holders = ar.getAccountHolders()
                .stream()
                        .map(accountHolderMapper::toAccountHolder)
                                .toList();

        account.addHolders(holders);
        account.setAccountStatus(AccountStatus.PENDING);
        Account saved = accountRepository.save(account);

        return accountMapper.toAccountResponse(saved);
    }

    @Override
    public AccountResponse updateAccount(Long id, AccountRequest ar) {
        return null;
    }

    @Override
    public void deleteAccount(Long id) {

    }

    @Override
    public Optional<AccountResponse> getAccount(Long id) {
        return accountRepository.findById(id).map(accountMapper::toAccountResponse);
    }

    @Override
    public AccountResponse updateAccountStatus(Long id, AccountRequest ar) {
        Account acc = accountRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Account not found")
        );
        acc.setAccountStatus(ar.getAccountStatus());
        Account updated = accountRepository.save(acc);
        return accountMapper.toAccountResponse(updated);
    }

    @Override
    public Optional<AccountResponse> getAccountByAccountNumber(String accountNumber) {
        return accountRepository.findAccountByAccountNumber(accountNumber).map(accountMapper::toAccountResponse);
    }

    @Override
    public Optional<AccountResponse> getAccountsByBranchId(Long branchId) {
        return accountRepository.findAccountsByBranchId(branchId).map(accountMapper::toAccountResponse);
    }

    @Override
    public List<AccountResponse> getAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(accountMapper::toAccountResponse)
                .collect(Collectors.toList());
    }
}
