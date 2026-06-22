package com.elitetech_inc.ensarkbank.branch.dto.request;


import com.elitetech_inc.ensarkbank.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.enums.BranchStatus;
import com.elitetech_inc.ensarkbank.enums.BranchType;
import lombok.Data;

@Data
public class BranchRequest {

    private String branchName;
    private String branchNumber;
    private String email;
    private Double cash_vault;
    private String address;
    private BranchType type;
    private BranchStatus status;
    private PoliceStation policeStation;

}
