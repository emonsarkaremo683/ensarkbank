package com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AccountTransactionResponse {

    private Long id;
    private String transactionId;
    private String senderAccountNumber;

    private String receiverAccountNumber;
    private String receiverName;
    private String bankName;

    private BigDecimal amount;


}
