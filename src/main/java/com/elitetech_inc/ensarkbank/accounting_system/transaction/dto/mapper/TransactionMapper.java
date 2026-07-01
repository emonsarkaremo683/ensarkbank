package com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.mapper;

import com.elitetech_inc.ensarkbank.account_management.account_transaction.dto.request.AccountTransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.dto.response.TransactionResponse;
import com.elitetech_inc.ensarkbank.accounting_system.transaction.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction t){
        TransactionResponse tr =new TransactionResponse();
        tr.setTransactionId(t.getTransactionId());
        tr.setTransactionType(t.getTransactionType());
        tr.setAmount(t.getAmount());
        tr.setChannel(t.getChannel());
        tr.setRemarks(t.getRemarks());
        tr.setStatus(t.getStatus());
        tr.setChargeAmount(t.getChargeAmount());
        tr.setVatAmount(t.getVatAmount());
        tr.setReferenceNo(t.getReferenceNo());

        return tr;
    }

    public Transaction toTransaction(TransactionRequest tr){
        Transaction t=new Transaction();
        tr.setAmount(tr.getAmount());
        tr.setRemarks(tr.getRemarks());

        return t;
    }
}
