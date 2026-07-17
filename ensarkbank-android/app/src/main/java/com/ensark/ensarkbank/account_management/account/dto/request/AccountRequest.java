package com.ensark.ensarkbank.account_management.account.dto.request;


import com.ensark.ensarkbank.account_management.account_holder.dto.request.AccountHolderRequest;
import com.ensark.ensarkbank.enums.AccountType;
import com.ensark.ensarkbank.enums.NomineeRelation;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class AccountRequest {
    private AccountType accountType;
    private BigDecimal availableBalance;
    private Long branchId;

    // nominee info
    private String n_name;
    private String n_email;
    private String n_phone;
    private NomineeRelation relation;
    private String n_photo;
    private String n_nid_front;
    private String n_nid_back;


    private List<AccountHolderRequest> accountHolders;
}
