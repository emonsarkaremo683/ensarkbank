package com.ensark.ensarkbank.account_management.account.dto.response;


import com.ensark.ensarkbank.account_management.account_holder.dto.response.AccountHolderResponse;
import com.ensark.ensarkbank.enums.AccountStatus;
import com.ensark.ensarkbank.enums.AccountType;
import com.ensark.ensarkbank.enums.NomineeRelation;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private AccountStatus accountStatus;
    private BigDecimal availableBalance;
    private BigDecimal currentBalance;
    private BigDecimal holdBalance;

    private String branchName;
    private String branchRoutingNumber;

    // nominee info
    private String n_name;
    private String n_email;
    private NomineeRelation relation;
    private String n_phone;
    private String n_photo;
    private String n_nid_front;
    private String n_nid_back;

    private List<AccountHolderResponse>holderResponses = new ArrayList<>();
}
