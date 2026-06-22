package com.elitetech_inc.ensarkbank.atm.service;

import com.elitetech_inc.ensarkbank.atm.dto.request.ATMRequestDTO;
import com.elitetech_inc.ensarkbank.atm.dto.response.ATMResponseDTO;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface ATMService {
    ATM save(ATMRequestDTO dto);
    List<ATMResponseDTO> getAll();
    Optional<ATMResponseDTO> findById(Long id);
    void delete(Long id);
    ATM update(ATMRequestDTO dto, Long id);
}
