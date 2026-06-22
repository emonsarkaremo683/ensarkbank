package com.elitetech_inc.ensarkbank.atm.dto.response;

import com.elitetech_inc.ensarkbank.enums.ATMStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ATMResponseDTO {
    private Long atmID;
    private Long branchID;
    private String branchName;
    private Double balance;
    private Double atmLimit;
    private ATMStatus status;
    private LocalDateTime lastMaintanance;
    private String address;
}
