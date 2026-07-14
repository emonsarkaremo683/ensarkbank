package com.elitetech_inc.ensarkbank.account_management.account.service;

import com.elitetech_inc.ensarkbank.account_management.account.dto.mapper.AccountMapper;
import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.mapper.AccountHolderMapper;
import com.elitetech_inc.ensarkbank.account_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.account_management.hold_transaction.service.HoldTransactionService;
import com.elitetech_inc.ensarkbank.account_management.nominee.entity.Nominee;
import com.elitetech_inc.ensarkbank.account_management.nominee.repository.NomineeRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionService;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.common.enums.HoldReason;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Utils;
import com.elitetech_inc.ensarkbank.util.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final AccountHolderMapper accountHolderMapper;
    private final Utils utils;
    private final NomineeRepository nomineeRepository;
    private final RequestValidator requestValidator;
    private final Validator validator;
    private final BranchRepository branchRepository;
    private final TransactionService transactionService;
    private final TransactionMapper transactionMapper;
    private final HoldTransactionService holdTransactionService;

    @Transactional
    @Override
    public AccountResponse createAccount(AccountRequest ar, Map<String, MultipartFile> nominees) {

        requestValidator.validateAccount(ar);

        List<AccountHolder> accountHolders = ar.getAccountHolders().stream().map(accountHolderMapper::toAccountHolder).toList();

        validator.checkKycStatus(accountHolders.stream().map(ah -> ah.getCustomer().getId()).findFirst().orElseThrow());

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
        account.setAccountStatus(AccountStatus.PENDING);

        Account saved = accountRepository.save(account);

        nominee.setAccount(saved);
        nomineeRepository.save(nominee);

        return accountMapper.toAccountResponse(saved);
    }


    @Override
    public void deleteAccount(Long id) {

    }

    @Override
    public Optional<AccountResponse> getAccount(Long id) {
        return accountRepository.findById(id).map(accountMapper::toAccountResponse);
    }

    @Override
    public AccountResponse updateAccountStatus(Long id, AccountStatus status) {
        Account acc = accountRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Account not found")
        );
        acc.setAccountStatus(status);

        if (status != AccountStatus.ACTIVE){
            Account updated = accountRepository.save(acc);
            return accountMapper.toAccountResponse(updated);
        }

        // Check if there are any active card-related holds before releasing deposit hold
        boolean hasCardHolds = holdTransactionService.hasActiveCardHolds(acc.getId());
        if (hasCardHolds) {
            log.warn("Account {} has active card holds, only releasing deposit hold", acc.getAccountNumber());
        }

        // Only release deposit-related holds (PENDING_APPROVAL), leave card holds untouched
        BigDecimal depositAmount = acc.getHoldBalance();
        if (depositAmount != null && depositAmount.compareTo(BigDecimal.ZERO) > 0) {
            Branch branch = acc.getBranch();
            if (branch != null) {
                String vaultAccountNumber = "br-" + branch.getRoutingNumber();

                TransactionRequest depositRequest = new TransactionRequest();
                depositRequest.setAmount(depositAmount);
                depositRequest.setRemarks("Initial deposit for account " + acc.getAccountNumber());

                Transaction depositTransaction = transactionMapper.toTransaction(depositRequest);
                depositTransaction.setTransactionType(TransactionType.DEPOSIT);
                depositTransaction.setChannel(TransactionChannel.BRANCH);

                transactionService.createTransaction(depositRequest, depositTransaction, vaultAccountNumber, acc.getAccountNumber());
            }
        }

        // Recalculate holdBalance from active HoldTransaction records (preserves card holds)
        BigDecimal activeHoldBalance = holdTransactionService.getActiveHoldBalance(acc.getId());
        acc.setAvailableBalance(depositAmount != null ? depositAmount : BigDecimal.ZERO);
        acc.setHoldBalance(activeHoldBalance);
        acc.setCurrentBalance(acc.getAvailableBalance().add(activeHoldBalance));
        Account updated = accountRepository.save(acc);
        return accountMapper.toAccountResponse(updated);
    }

    @Override
    public Optional<AccountResponse> getAccountByAccountNumber(String accountNumber) {
        return accountRepository.findAccountByAccountNumber(accountNumber).map(accountMapper::toAccountResponse);
    }

    @Override
    public List<AccountResponse> getAccountsByBranchId(Long branchId) {
        return accountRepository.findAllByBranchId(branchId)
                .stream()
                .map(accountMapper::toAccountResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AccountResponse> getAccountsByBranchIds(List<Long> branchIds) {
        return branchIds.stream()
                .flatMap(branchId -> accountRepository.findAllByBranchId(branchId).stream())
                .distinct()
                .map(accountMapper::toAccountResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> resolveBranchAndChildIds(Long branchId) {
        List<Long> result = new java.util.ArrayList<>();
        result.add(branchId);
        collectChildBranchIds(branchId, result);
        return result;
    }

    private void collectChildBranchIds(Long parentId, List<Long> result) {
        List<Branch> children = branchRepository.findByParentBranch_Id(parentId);
        for (Branch child : children) {
            result.add(child.getId());
            collectChildBranchIds(child.getId(), result);
        }
    }

    @Override
    public List<AccountResponse> getAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(accountMapper::toAccountResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AccountResponse> getAccountsByCustomerId(Long customerId) {
        return accountRepository.findDistinctByHoldersCustomerId(customerId)
                .stream()
                .map(accountMapper::toAccountResponse)
                .collect(Collectors.toList());
    }
}
