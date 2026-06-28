package com.elitetech_inc.ensarkbank.atm.dto.request;

import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.enums.ATMStatus;
import lombok.Data;

@Data
public class AtmRequest {
    private ATMStatus status;
    private Double balance;
    private Double limit;
    private String address;
    private Branch branch;
}
