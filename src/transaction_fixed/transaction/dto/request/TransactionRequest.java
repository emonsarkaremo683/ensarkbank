package com.elitetech_inc.ensarkbank.transaction.dto.request;

import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionRequest {

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    @NotNull(message = "Channel is required")
    private TransactionChannel channel;

    // FIX: BigDecimal + validation — never accept null or ≤ 0 at request boundary
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    // Optional: server can compute these, but allow client to pass pre-calculated values
    private BigDecimal chargeAmount;

    private BigDecimal vatAmount;

    private String remarks;
}
