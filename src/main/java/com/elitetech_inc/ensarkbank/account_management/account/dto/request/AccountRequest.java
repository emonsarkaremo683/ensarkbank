package com.elitetech_inc.ensarkbank.account_management.account.dto.request;

import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.request.AccountHolderRequest;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.common.enums.AccountType;
import lombok.Data;

import java.util.List;

@Data
public class AccountRequest {
    private AccountType accountType;
    private Double availableBalance;
    private Long branchId;
    private AccountStatus accountStatus;

    private List<AccountHolderRequest> accountHolders;
}
