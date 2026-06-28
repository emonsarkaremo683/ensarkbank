package com.elitetech_inc.ensarkbank.atm.dto.response;

import com.elitetech_inc.ensarkbank.enums.ATMStatus;
import com.elitetech_inc.ensarkbank.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import lombok.Data;

@Data
public class AtmResponse {
    private ATMStatus status;
    private Double limit;
    private String address;
    private String routingNumber;
    private String accNumber;
    private AccountType type;
    private AccountStatus accountStatus;
    private Double availableBalance;
   private String branchName;
}
