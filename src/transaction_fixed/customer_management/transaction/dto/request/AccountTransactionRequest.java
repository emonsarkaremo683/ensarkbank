package com.elitetech_inc.ensarkbank.customer_management.transaction.dto.request;

import com.elitetech_inc.ensarkbank.transaction.dto.request.TransactionRequest;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class AccountTransactionRequest extends TransactionRequest {

    @NotBlank(message = "Sender account number is required")
    private String senderAccountNumber;

    // FIX: receiverAccountNumber is nullable for DEPOSIT type (no sender→receiver needed)
    // but required for TRANSFER, PAYMENT, OUTWARD_TRANSFER.
    // Cross-field validation handled in service, not here.
    private String receiverAccountNumber;

    private String receiverName;

    private String receiverBankName;
}
