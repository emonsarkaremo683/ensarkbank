package com.elitetech_inc.ensarkbank.atm.dto.mapper;


import com.elitetech_inc.ensarkbank.atm.dto.request.ATMRequestDTO;
import com.elitetech_inc.ensarkbank.atm.dto.response.ATMResponseDTO;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import org.springframework.stereotype.Component;


@Component
public class ATMMapper {


    public ATMResponseDTO toDTO(ATM atm) {

        if (atm == null) return null;

        ATMResponseDTO ard = new ATMResponseDTO();


        return new ATMResponseDTO(
                atm.getId(),
                atm.getBranch() != null ? atm.getBranch().getId() : null,
                atm.getBranch() != null ? atm.getBranch().getName() : null,
                atm.getCurrentBalance() != null ?  atm.getCurrentBalance() : 0.0,
                atm.getAtmlimit(),
                atm.getStatus(),
                (atm.getAtmTransections() != null && !atm.getAtmTransections().isEmpty() && atm.getAtmTransections().getLast().getUpdatedAt() != null) ? atm.getAtmTransections().getLast().getUpdatedAt() : null,
                atm.getAddress()
        );
    }

    public ATM toEntity(ATMRequestDTO dto, Branch branch) {

        if (dto == null) return null;

        ATM atm = new ATM();
        atm.setBranch(branch);
        atm.setAtmlimit(dto.getAtmLimit());
        atm.setStatus(dto.getStatus());
        atm.setAddress(dto.getAddress());
        atm.setCurrentBalance(0.0);

        return atm;
    }



}