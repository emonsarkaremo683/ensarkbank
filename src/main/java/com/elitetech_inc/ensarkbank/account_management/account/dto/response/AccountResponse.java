package com.elitetech_inc.ensarkbank.account_management.account.dto.response;

import com.elitetech_inc.ensarkbank.account_management.account_holder.dto.response.AccountHolderResponse;
import com.elitetech_inc.ensarkbank.common.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.common.enums.AccountType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class AccountResponse {
    private String accountNumber;
    private AccountType accountType;
    private AccountStatus accountStatus;
    private BigDecimal availableBalance;
    private BigDecimal currentBalance;
    private BigDecimal holdBalance;

    private String branchName;

    private List<AccountHolderResponse>holderResponses = new ArrayList<>();
}
