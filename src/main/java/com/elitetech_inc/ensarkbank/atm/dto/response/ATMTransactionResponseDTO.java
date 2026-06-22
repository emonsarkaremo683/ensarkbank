package com.elitetech_inc.ensarkbank.atm.dto.response;

import com.elitetech_inc.ensarkbank.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ATMTransactionResponseDTO {

    private Long transactionId;
    private Long atmId;
    private Double transactionAmount;
    private Double currentBalance;
    private TransactionType type;
    private LocalDateTime createdAt;
}
