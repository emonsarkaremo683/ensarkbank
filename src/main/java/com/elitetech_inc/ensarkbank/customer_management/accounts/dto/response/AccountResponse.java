package com.elitetech_inc.ensarkbank.customer_management.accounts.dto.response;

import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import com.elitetech_inc.ensarkbank.enums.HolderType;
import lombok.Data;

@Data
public class AccountResponse {

    private AccountType type;
    private AccountStatus accountStatus;
    private Double availableBalance;
    private Double currentBalance;
    private Double holdBalance;
    private String accountNumber;
    private String branchName;

    // for all type customer accounts
    private HolderType p_holderType;
    private Boolean p_canWithdraw;
    private Boolean p_canDeposit;
    private String p_customer_name;


    // for JOINT_ACCOUNT and BUSINESS Account
    private HolderType s_holderType;
    private Boolean s_canWithdraw;
    private Boolean s_canDeposit;
    private String s_customer_name;

    // only for BUSINESS Account
    private HolderType o_holderType;
    private Boolean o_canWithdraw;
    private Boolean o_canDeposit;
    private String o_customer_name;
}
