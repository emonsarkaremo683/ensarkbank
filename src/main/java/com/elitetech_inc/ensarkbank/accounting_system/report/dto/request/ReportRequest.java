package com.elitetech_inc.ensarkbank.accounting_system.report.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportRequest {
    private Long branchId;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
}
