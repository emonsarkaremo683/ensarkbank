package com.elitetech_inc.ensarkbank.account_management.cashier_transaction.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account.service.AccountService;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.CashierTransaction;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionMapper;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionRequest;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto.CashierTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.repository.CashierTransactionRepository;
import com.elitetech_inc.ensarkbank.accounting_system.journal.entity.JoinHelper;
import com.elitetech_inc.ensarkbank.accounting_system.journal.repository.JoinHelperRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.repository.TransactionRepository;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.service.TransactionService;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.email.TransactionEmailService;
import com.elitetech_inc.ensarkbank.common.enums.HolderType;
import com.elitetech_inc.ensarkbank.common.enums.NotificationType;
import com.elitetech_inc.ensarkbank.common.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.common.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.common.enums.TransactionType;
import com.elitetech_inc.ensarkbank.common.exception.ResourceNotFoundException;
import com.elitetech_inc.ensarkbank.common.notification.websocket.WebSocketNotificationService;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.repository.EmployeeRepository;
import com.elitetech_inc.ensarkbank.util.BranchValidator;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CashierTransactionServiceImpl implements CashierTransactionService {

    private final CashierTransactionRepository cashierTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final BranchRepository branchRepository;
    private final CashierTransactionMapper cashierTransactionMapper;
    private final TransactionMapper transactionMapper;
    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final TransactionService transactionService;
    private final JoinHelperRepository joinHelperRepository;
    private final BranchValidator branchValidator;
    private final RequestValidator requestValidator;
    private final Validator validator;
    private final EmployeeRepository employeeRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final TransactionEmailService transactionEmailService;

    @Override
    public CashierTransactionResponse createTransaction(CashierTransactionRequest request) {
        requestValidator.validateCashierTransaction(request);
        if (request.getTransactionRequest() == null) {
            throw new IllegalArgumentException("Transaction request is required");
        }
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", request.getBranchId()));

        branchValidator.assertNotAgentBank(branch.getId());

        Account branchAcc = accountService.getOrCreateVaultAccount(branch);
        if (validator.checkAccountExists(request.getAccountNumber())){
            validator.checkAccountStatus(request.getAccountNumber());
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId()).orElseThrow(
                () -> new ResourceNotFoundException("Employee not found", request.getEmployeeId())
        );

        CashierTransaction cashierTransaction = new CashierTransaction();
        cashierTransaction.setCheckNo(request.getCheckNo());
        cashierTransaction.setBranch(branch);
        cashierTransaction.setAccountNumber(request.getAccountNumber());
        cashierTransaction.setAccountName(request.getAccountName());
        cashierTransaction.setBankName(request.getBankName());
        cashierTransaction.setRoutingNumber(request.getRoutingNumber());
        cashierTransaction.setEmployee(employee);

        Transaction transaction = transactionMapper.toTransaction(request.getTransactionRequest());
        transaction.setTransactionType(request.getType());
        transaction.setChannel(TransactionChannel.BRANCH);
        transaction.setStatus(TransactionStatus.SUCCESS);

        if(request.getType() == TransactionType.DEPOSIT){
            transactionService.createTransaction(
                    request.getTransactionRequest(),
                    transaction,
                    branchAcc.getAccountNumber(),
                    request.getAccountNumber()
            );
        } else{
            transactionService.createTransaction(
                    request.getTransactionRequest(),
                    transaction,
                    request.getAccountNumber(),
                    branchAcc.getAccountNumber()
            );
        }

        cashierTransaction.setTransaction(transaction);

        CashierTransaction saved = cashierTransactionRepository.save(cashierTransaction);

        JoinHelper jh = new JoinHelper();
        jh.setCashierTransaction(saved);
        jh.setTransaction(transaction);
        joinHelperRepository.save(jh);

        sendTransactionNotifications(saved, request);

        return cashierTransactionMapper.toResponse(saved);
    }

    private void sendTransactionNotifications(CashierTransaction saved, CashierTransactionRequest request) {
        try {
            Account customerAccount = accountRepository.findAccountByAccountNumber(request.getAccountNumber()).orElse(null);
            if (customerAccount == null || customerAccount.getHolders() == null || customerAccount.getHolders().isEmpty()) {
                return;
            }

            AccountHolder holder = customerAccount.getHolders().stream()
                    .filter(h -> h.getHolderType() == HolderType.PRIMARY)
                    .findFirst()
                    .orElse(customerAccount.getHolders().getFirst());

            Customer customer = holder.getCustomer();
            if (customer == null || customer.getUser() == null) {
                return;
            }

            Long userId = customer.getUser().getId();
            String customerEmail = customer.getUser().getEmail();
            String amount = request.getTransactionRequest().getAmount().toPlainString();
            String type = request.getType().name();

            String title = type + " of $" + amount + " Successful";
            String message = "Your " + type.toLowerCase() + " transaction of $" + amount +
                    " to account " + request.getAccountNumber() + " has been processed successfully. " +
                    "Branch: " + saved.getBranch().getName();

            webSocketNotificationService.sendNotificationToUser(
                    userId,
                    type.equals("DEPOSIT") ? NotificationType.DEPOSIT : NotificationType.WITHDRAW,
                    title,
                    message,
                    saved.getId().toString(),
                    "CASHIER_TRANSACTION"
            );

            sendCashierTransactionEmail(customerEmail, customer.getName(), request);

        } catch (Exception e) {
            log.error("Failed to send cashier transaction notifications: {}", e.getMessage());
        }
    }

    private void sendCashierTransactionEmail(String email, String customerName, CashierTransactionRequest request) {
        String amount = request.getTransactionRequest().getAmount().toPlainString();
        String type = request.getType().name();
        transactionEmailService.sendCashierTransactionEmail(email, customerName, type, amount, request.getAccountNumber());
    }

    @Override
    public CashierTransactionResponse getTransactionById(Long id) {
        CashierTransaction cashierTransaction = cashierTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CashierTransaction", id));
        return cashierTransactionMapper.toResponse(cashierTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashierTransactionResponse> getAllTransactions() {
        return cashierTransactionRepository.findAll()
                .stream()
                .map(cashierTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashierTransactionResponse> getByAccountNumber(String accountNumber) {
        return cashierTransactionRepository.findByAccountNumber(accountNumber)
                .stream()
                .map(cashierTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashierTransactionResponse> getByBranchId(Long branchId) {
        return cashierTransactionRepository.findByBranchId(branchId)
                .stream()
                .map(cashierTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashierTransactionResponse> getByBranchIds(List<Long> branchIds) {
        return cashierTransactionRepository.findByBranchIds(branchIds)
                .stream()
                .map(cashierTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CashierTransactionResponse updateTransaction(Long id, CashierTransactionRequest request) {
        CashierTransaction existing = cashierTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CashierTransaction", id));

        if (request.getCheckNo() != null) {
            existing.setCheckNo(request.getCheckNo());
        }

        if (request.getTransactionRequest() != null) {
            Transaction updatedTransaction = transactionMapper.toTransaction(request.getTransactionRequest());
            updatedTransaction.setId(existing.getTransaction().getId());
            Transaction savedTransaction = transactionRepository.save(updatedTransaction);
            existing.setTransaction(savedTransaction);
        }


        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", request.getBranchId()));
            existing.setBranch(branch);
        }

        CashierTransaction updated = cashierTransactionRepository.save(existing);
        return cashierTransactionMapper.toResponse(updated);
    }

    @Override
    public void deleteTransaction(Long id) {
        if (!cashierTransactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("CashierTransaction", id);
        }
        cashierTransactionRepository.deleteById(id);
    }

}
