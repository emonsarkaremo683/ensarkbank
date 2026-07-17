package com.ensark.ensarkbank.accounting_system.report.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ReportRequest {
    private Long branchId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String role;
    private Long userBranchId;
}
