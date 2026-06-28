package com.elitetech_inc.ensarkbank.atm.dto.mapper;

import com.elitetech_inc.ensarkbank.atm.dto.request.AtmRequest;
import com.elitetech_inc.ensarkbank.atm.dto.response.AtmResponse;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AtmMapper {
    private final Utils utils;

    public AtmResponse toResponse(ATM atm){
        AtmResponse response = new AtmResponse();
        response.setStatus(atm.getStatus());
        response.setLimit(atm.getLimit());
        response.setAddress(atm.getAddress());
        response.setRoutingNumber(atm.getAtmRouting());
        response.setAccNumber(atm.getAccount().getAccNumber());
        response.setType(atm.getAccount().getType());
        response.setAccountStatus(atm.getAccount().getAccountStatus());
        response.setAvailableBalance(atm.getAccount().getAvailableBalance());
        response.setBranchName(atm.getBranch().getName());
        return  response;
    }

    public ATM toATM(AtmRequest ar){
        ATM atm = new ATM();
        atm.setStatus(ar.getStatus());
        atm.setLimit(ar.getLimit());
        atm.setAddress(ar.getAddress());
        atm.setAtmRouting(utils.generateRouteNumber());
        return atm;
    }
}
