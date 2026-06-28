package com.elitetech_inc.ensarkbank.transaction.dto.mapper;

import com.elitetech_inc.ensarkbank.enums.TransactionStatus;
import com.elitetech_inc.ensarkbank.transaction.dto.request.TransactionRequest;
import com.elitetech_inc.ensarkbank.transaction.entity.Transaction;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionMapper {

    private final Utils utils;

    public Transaction toTransaction(TransactionRequest tr) {

        Transaction t = new Transaction();

        t.setReferenceNo(utils.generateReference());

        t.setTransactionType(tr.getTransactionType());

        t.setChannel(tr.getChannel());

        t.setStatus(TransactionStatus.PENDING);

        t.setAmount(tr.getAmount());

        t.setChargeAmount(
                tr.getChargeAmount() == null ? 0.0 : tr.getChargeAmount()
        );

        t.setVatAmount(
                tr.getVatAmount() == null ? 0.0 : tr.getVatAmount()
        );

        t.setRemarks(tr.getRemarks());

        return t;
    }

}
