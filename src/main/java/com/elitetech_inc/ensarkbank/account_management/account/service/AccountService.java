package com.elitetech_inc.ensarkbank.account_management.account.service;

import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface AccountService {
    AccountResponse createAccount(AccountRequest ar, Map<String, MultipartFile> nominees);

    void deleteAccount(Long id);
    Optional<AccountResponse> getAccount(Long id);
    AccountResponse updateAccountStatus(Long id, AccountStatus ar);
    Optional<AccountResponse> getAccountByAccountNumber(String accountNumber);
    List<AccountResponse> getAccountsByBranchId(Long branchId);
    List<AccountResponse> getAccountsByBranchIds(List<Long> branchIds);
    List<Long> resolveBranchAndChildIds(Long branchId);
    List<AccountResponse> getAccounts();
    List<AccountResponse> getAccountsByCustomerId(Long customerId);
    com.elitetech_inc.ensarkbank.account_management.account.entity.Account getOrCreateVaultAccount(Branch branch);

}
