package com.elitetech_inc.ensarkbank.accounting_system.journal.controller;

import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalResponse;
import com.elitetech_inc.ensarkbank.accounting_system.journal.service.JournalService;
import com.elitetech_inc.ensarkbank.accounting_system.journal.service.TransactionHistoryExportService;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.customer_management.customer.repository.CustomerRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/history/")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;
    private final TransactionHistoryExportService exportService;
    private final CustomerRepository customerRepository;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isAccountNumberOwner(#accountNumber, authentication))")
    @GetMapping("{accountNumber}")
    public ResponseEntity<List<JournalResponse>> getByNumber(@PathVariable String accountNumber){
        return ResponseEntity.ok(journalService.getByAccountNumber(accountNumber));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'AUDITOR')")
    @GetMapping("entry-id/{id}")
    public ResponseEntity<JournalResponse> getByJournalId(@PathVariable Long id){
        return ResponseEntity.ok(journalService.getJournalByJournalId(id).orElseThrow(
                ()-> new IllegalArgumentException("not found")
        ));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#id, authentication))")
    @GetMapping("customer/{id}")
    public ResponseEntity<List<JournalResponse>> getTransactionHistoryByCustomerIdUsingDate(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate){
        return ResponseEntity.ok(journalService.getJournalByAccountId(id, startDate, endDate));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'AUDITOR') or (hasRole('CUSTOMER') and @customerSecurity.isCustomerIdsMatch(#customerId, authentication))")
    @GetMapping("customer/{customerId}/export")
    public void exportTransactionHistory(
            @PathVariable Long customerId,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "PDF") String format,
            HttpServletResponse response,
            Authentication auth) throws Exception {

        List<JournalResponse> entries;
        String customerName = "Customer";
        String displayAccount = accountNumber;

        if (accountNumber != null && !accountNumber.isBlank()) {
            entries = journalService.getByAccountNumber(accountNumber);
            if (startDate != null || endDate != null) {
                LocalDateTime from = startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0);
                LocalDateTime to = endDate != null ? endDate : LocalDateTime.now();
                entries = entries.stream()
                        .filter(e -> e.getDate() != null && !e.getDate().isBefore(from) && !e.getDate().isAfter(to))
                        .toList();
            }
        } else {
            entries = journalService.getJournalByAccountId(customerId, startDate, endDate);
            displayAccount = "All Accounts";
        }

        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer != null) {
            customerName = customer.getName();
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String safeAccount = displayAccount != null ? displayAccount.replaceAll("[^a-zA-Z0-9]", "_") : "all";

        switch (format.toUpperCase()) {
            case "EXCEL": {
                String filename = "TransactionHistory_" + safeAccount + "_" + timestamp + ".xlsx";
                response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
                byte[] excelBytes = exportService.generateExcel(entries, displayAccount, customerName, startDate, endDate);
                response.getOutputStream().write(excelBytes);
                response.getOutputStream().flush();
                break;
            }
            case "CSV": {
                String filename = "TransactionHistory_" + safeAccount + "_" + timestamp + ".csv";
                response.setContentType("text/csv");
                response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
                PrintWriter writer = response.getWriter();
                exportService.generateCsv(entries, writer);
                writer.flush();
                break;
            }
            default: {
                String filename = "TransactionHistory_" + safeAccount + "_" + timestamp + ".pdf";
                response.setContentType("application/pdf");
                response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
                byte[] pdfBytes = exportService.generatePdf(entries, displayAccount, customerName, startDate, endDate);
                response.getOutputStream().write(pdfBytes);
                response.getOutputStream().flush();
                break;
            }
        }
    }
}
