package com.elitetech_inc.ensarkbank.accounting_system.report.controller;

import com.elitetech_inc.ensarkbank.accounting_system.report.dto.request.ReportRequest;
import com.elitetech_inc.ensarkbank.accounting_system.report.dto.response.BalanceSheetResponse;
import com.elitetech_inc.ensarkbank.accounting_system.report.dto.response.LedgerResponse;
import com.elitetech_inc.ensarkbank.accounting_system.report.dto.response.TrialBalanceResponse;
import com.elitetech_inc.ensarkbank.accounting_system.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports/")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("ledger/{branchId}/{accountNumber}")
    public ResponseEntity<LedgerResponse> ledger(@PathVariable Long branchId,
                                                 @PathVariable String accountNumber,
                                                 @RequestBody(required = false) ReportRequest request) {
        return ResponseEntity.ok(
                reportService.getLedger(branchId, accountNumber, normalize(request)));
    }

    @PostMapping("ledger")
    public ResponseEntity<List<LedgerResponse>> ledgers(@RequestBody(required = false) ReportRequest request) {
        return ResponseEntity.ok(reportService.getLedgers(normalize(request)));
    }

    @PostMapping("trial-balance")
    public ResponseEntity<TrialBalanceResponse> trialBalance(@RequestBody(required = false) ReportRequest request) {
        return ResponseEntity.ok(reportService.getTrialBalance(normalize(request)));
    }

    @PostMapping("balance-sheet")
    public ResponseEntity<BalanceSheetResponse> balanceSheet(@RequestBody(required = false) ReportRequest request) {
        return ResponseEntity.ok(reportService.getBalanceSheet(normalize(request)));
    }

    private ReportRequest normalize(ReportRequest request) {
        return request != null ? request : new ReportRequest();
    }
}
