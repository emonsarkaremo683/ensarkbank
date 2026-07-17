package com.ensark.ensarkbank.account_management.account_holder.dto.request;


import com.ensark.ensarkbank.enums.HolderType;

import lombok.Data;

@Data
public class AccountHolderRequest {
    private HolderType holderType;
    private Boolean canWithdraw;
    private Boolean canDeposit;
    private Boolean canApproveTransaction;

    private Long customerId;
}
