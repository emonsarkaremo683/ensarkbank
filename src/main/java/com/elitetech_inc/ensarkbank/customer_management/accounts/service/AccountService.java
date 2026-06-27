package com.elitetech_inc.ensarkbank.customer_management.accounts.service;

import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.customer_management.accounts.dto.response.AccountResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface AccountService {
    AccountResponse createAccount(AccountRequest ar);
    AccountResponse updateAccount(Long id, AccountRequest ar);
    void deleteAccount(Long id);
    AccountResponse getAccountHoldersByAccountNumber(String accNumber);
    List<AccountResponse> getAll();
}
