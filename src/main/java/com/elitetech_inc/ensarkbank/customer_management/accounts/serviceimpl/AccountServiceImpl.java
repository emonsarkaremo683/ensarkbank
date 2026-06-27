package com.elitetech_inc.ensarkbank.customer_management.accounts.serviceimpl;

import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.mapper.AccountMapper;
import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.customer_management.accounts.service.AccountService;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;

    @Override
    public AccountResponse createAccount(AccountRequest ar) {
        Account acc = accountMapper.toAccount(ar);

        acc.getHolders().add(accountMapper.toPrimaryAccountHolder(ar, acc));

        if (acc.getType().equals(AccountType.JOINT_ACCOUNT)
                || acc.getType().equals(AccountType.BUSINESS)
        ){
            acc.getHolders().add(accountMapper.toSecondaryAccountHolder(ar, acc));
        }

        if (acc.getType().equals(AccountType.BUSINESS)){
            acc.getHolders().add(accountMapper.toOtherAccountHolder(ar, acc));
        }

        return accountMapper.toAccountResponse(accountRepository.save(acc));
    }

    @Override
    public AccountResponse updateAccount(Long id, AccountRequest ar) {

        return null;
    }

    @Override
    public void deleteAccount(Long id) {

    }

    @Override
    public AccountResponse getAccountHoldersByAccountNumber(String accNumber) {
        Account acc = accountRepository.findByAccNumber(accNumber).orElseThrow();
        return accountMapper.toAccountResponse(acc);
    }

    @Override
    public List<AccountResponse> getAll() {
        return accountRepository.findAll()
                .stream()
                .map(accountMapper::toAccountResponse)
                .collect(
                        Collectors.toList()
                );
    }
}
