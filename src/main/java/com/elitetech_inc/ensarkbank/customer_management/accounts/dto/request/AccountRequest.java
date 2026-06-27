package com.elitetech_inc.ensarkbank.customer_management.accounts.dto.request;

import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.customer_management.customer.entity.Customer;
import com.elitetech_inc.ensarkbank.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import com.elitetech_inc.ensarkbank.enums.HolderType;
import lombok.Data;

@Data
public class AccountRequest {
    private AccountType type;
    private AccountStatus accountStatus;
    private Double balance;
    private Branch branch;

    // for all type customer accounts
    private HolderType p_holderType;
    private Boolean p_canWithdraw;
    private Boolean p_canDeposit;
    private Customer p_customer;


    // for JOINT_ACCOUNT and BUSINESS Account
    private HolderType s_holderType;
    private Boolean s_canWithdraw;
    private Boolean s_canDeposit;
    private Customer s_customer;

    // only for BUSINESS Account
    private HolderType o_holderType;
    private Boolean o_canWithdraw;
    private Boolean o_canDeposit;
    private Customer o_customer;

}
