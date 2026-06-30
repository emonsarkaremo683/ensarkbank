package com.elitetech_inc.ensarkbank.account_management.account.dto.response;

import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.response.AccountHolderResponse;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.common.enums.AccountType;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AccountResponse {
    private String accountNumber;
    private AccountType accountType;
    private AccountStatus accountStatus;
    private Double availableBalance;
    private Double currentBalance;
    private Double holdBalance;

    private String branchName;

    private List<AccountHolderResponse>holderResponses = new ArrayList<>();
}
