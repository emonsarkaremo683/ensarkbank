package com.elitetech_inc.ensarkbank.transaction.dto.request;

import com.elitetech_inc.ensarkbank.enums.TransactionChannel;
import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.enums.TransactionType;
import lombok.Data;

@Data
public class TransactionRequest {

    private TransactionType transactionType;
    private TransactionChannel channel;
    private Double amount;
    private Double chargeAmount;
    private Double vatAmount;
    private String remarks;

}
