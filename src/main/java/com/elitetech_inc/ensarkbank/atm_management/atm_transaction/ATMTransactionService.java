package com.elitetech_inc.ensarkbank.atm_management.atm_transaction;

import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionRequest;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public interface ATMTransactionService {
    ATMTransactionResponse transaction(ATMTransactionRequest request);
    ATMTransactionResponse refill(Long atmId, BigDecimal amount);

}
