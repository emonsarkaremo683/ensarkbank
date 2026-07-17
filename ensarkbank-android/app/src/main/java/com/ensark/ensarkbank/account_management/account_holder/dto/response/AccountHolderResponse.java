package com.ensark.ensarkbank.account_management.account_holder.dto.response;


import com.ensark.ensarkbank.enums.HolderType;

import lombok.Data;

@Data
public class AccountHolderResponse {

    private Long id;
    private String accountHolderName;
    private HolderType holderType;
    private Boolean canWithdraw;
    private Boolean canDeposit;
    private Boolean canApproveTransaction;
}
