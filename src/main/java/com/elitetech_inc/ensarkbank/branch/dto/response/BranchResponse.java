package com.elitetech_inc.ensarkbank.branch.dto.response;

import com.elitetech_inc.ensarkbank.enums.BranchStatus;
import com.elitetech_inc.ensarkbank.enums.BranchType;
import lombok.Data;

@Data
public class BranchResponse {
    private Long branchID;
    private String branchName;
    private String branchNumber;
    private String routingNumber;
    private Double cash_vault;
    private String email;
    private String address;
    private BranchType type;
    private BranchStatus status;

}
