package com.elitetech_inc.ensarkbank.atm.dto.request;

import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.enums.ATMStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ATMRequestDTO {

    private ATMStatus status;
    private Double currentBalance;
    private Double atmLimit;
    private String address;
    private Branch branch;
}
