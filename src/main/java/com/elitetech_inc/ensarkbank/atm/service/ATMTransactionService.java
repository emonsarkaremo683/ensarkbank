package com.elitetech_inc.ensarkbank.atm.service;


import com.elitetech_inc.ensarkbank.atm.dto.request.ATMTransactionRequestDTO;
import com.elitetech_inc.ensarkbank.atm.dto.response.ATMTransactionResponseDTO;
import com.elitetech_inc.ensarkbank.atm.entity.ATMTransaction;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public interface ATMTransactionService {
    ATMTransaction save(ATMTransactionRequestDTO dto);
    List<ATMTransactionResponseDTO> getAll();
    Optional<ATMTransactionResponseDTO> findById(Long id);
    void delete(Long id);
    ATMTransaction update(ATMTransactionRequestDTO dto, Long id);
}
