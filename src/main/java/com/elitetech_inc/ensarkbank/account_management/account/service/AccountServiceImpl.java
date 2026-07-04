package com.elitetech_inc.ensarkbank.account_management.account.service;

import com.elitetech_inc.ensarkbank.account_management.account.dto.mapper.AccountMapper;
import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.mapper.AccountHolderMapper;
import com.elitetech_inc.ensarkbank.account_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.account_management.nominee.entity.Nominee;
import com.elitetech_inc.ensarkbank.account_management.nominee.repository.NomineeRepository;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final AccountHolderMapper accountHolderMapper;
    private final Utils utils;
    private final NomineeRepository nomineeRepository;

    @Transactional
    @Override
    public AccountResponse createAccount(AccountRequest ar, Map<String, MultipartFile> nominees) {

        Account account = accountMapper.toAccount(ar);

        // Set Account Holders
        List<AccountHolder> holders = ar.getAccountHolders()
                .stream()
                        .map(accountHolderMapper::toAccountHolder)
                                .toList();

        account.addHolders(holders);

        // Saving Nominee
        Nominee nominee = accountMapper.toNominee(ar);
        if(nominees != null && !nominees.isEmpty()){
            for(Map.Entry<String, MultipartFile> n_doc : nominees.entrySet()){
                String key = n_doc.getKey();
                MultipartFile file = n_doc.getValue();

                String path = utils.uploadFile(file, "nominee", holders.getFirst().getCustomer().getName());

                if(key.equals("nid_front")) nominee.setNid_front(path);
                if(key.equals("nid_back")) nominee.setNid_back(path);
                if(key.equals("photo")) nominee.setPhoto(path);
            }
        }

        Account saved = accountRepository.save(account);

        nominee.setAccount(saved);
        nomineeRepository.save(nominee);

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
