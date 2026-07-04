package com.elitetech_inc.ensarkbank.account_management.account.service;

import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public interface AccountService {
    AccountResponse createAccount(AccountRequest ar, Map<String, MultipartFile> nominees);
    AccountResponse updateAccount(Long id, AccountRequest ar);
    void deleteAccount(Long id);
    Optional<AccountResponse> getAccount(Long id);
    AccountResponse updateAccountStatus(Long id, AccountRequest ar);
    Optional<AccountResponse> getAccountByAccountNumber(String accountNumber);
    Optional<AccountResponse> getAccountsByBranchId(Long branchId);
    List<AccountResponse> getAccounts();

}
