package com.elitetech_inc.ensarkbank.account_management.cashier_transaction.dto;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.mapper.AccountTransactionMapper;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response.AccountTransactionResponse;
import com.elitetech_inc.ensarkbank.account_management.account_transaction.entity.AccountTransaction;
import com.elitetech_inc.ensarkbank.account_management.cashier_transaction.CashierTransaction;
import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper.TransactionMapper;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.common.enums.Role;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.entity.Employee;
import com.elitetech_inc.ensarkbank.human_resource_management.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CashierTransactionMapper {

    private final EmployeeRepository employeeRepository;
    private final AccountTransactionMapper accountTransactionMapper;
    private final TransactionMapper transactionMapper;

    public CashierTransactionResponse toResponse(CashierTransaction ct) {
        TransactionResponse transactionResponse = null;
        List<JournalResponse> journalResponses = Collections.emptyList();

        if (ct.getTransaction() != null) {
            transactionResponse = transactionMapper.toResponse(ct.getTransaction());
            journalResponses = mapJournals(ct.getTransaction());
        }

        AccountTransactionResponse accountTransactionResponse = null;
        if (ct.getAccountTransaction() != null) {
            accountTransactionResponse = accountTransactionMapper.toResponse(ct.getAccountTransaction(), null);
        }

        String cashierName = "";
        String branchName = "";
        if (ct.getBranch() != null) {
            branchName = ct.getBranch().getName();
            List<Employee> empList = employeeRepository.findEmployeeByBranchId(ct.getBranch().getId());
            cashierName = empList
                    .stream()
                    .filter(emp -> emp.getUser() != null && emp.getUser().getRole() == Role.CASHIER)
                    .map(Employee::getName)
                    .findFirst()
                    .orElse("");
        }

        return CashierTransactionResponse.builder()
                .id(ct.getId())
                .checkNo(ct.getCheckNo())
                .cashierName(cashierName)
                .branchName(branchName)
                .accountTransaction(accountTransactionResponse)
                .transaction(transactionResponse)
                .journals(journalResponses)
                .build();
    }

    private List<JournalResponse> mapJournals(Transaction transaction) {
        if (transaction.getEntries() == null || transaction.getEntries().isEmpty()) {
            return Collections.emptyList();
        }
        return transaction.getEntries().stream()
                .map(journal -> {
                    JournalResponse jr = new JournalResponse();
                    jr.setAccountNumber(journal.getAccountNumber());
                    jr.setEntryType(journal.getEntryType());
                    jr.setAmount(journal.getAmount());
                    return jr;
                })
                .collect(Collectors.toList());
    }
}
