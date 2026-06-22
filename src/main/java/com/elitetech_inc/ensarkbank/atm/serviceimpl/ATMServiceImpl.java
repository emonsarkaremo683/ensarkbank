package com.elitetech_inc.ensarkbank.atm.serviceimpl;

import com.elitetech_inc.ensarkbank.atm.dto.mapper.ATMMapper;
import com.elitetech_inc.ensarkbank.atm.dto.request.ATMRequestDTO;
import com.elitetech_inc.ensarkbank.atm.dto.response.ATMResponseDTO;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.atm.repository.ATMRepository;
import com.elitetech_inc.ensarkbank.atm.service.ATMService;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;


@Service
public class ATMServiceImpl implements ATMService {

    @Autowired
    private ATMMapper atmMapper;

    @Autowired
    private ATMRepository atmRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Override
    public ATM save(ATMRequestDTO dto) {

        Branch branch = branchRepository.findById(dto.getBranch().getId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        ATM atm = atmMapper.toEntity(dto, branch);
        atm.setBranch(branch);

        return atmRepository.save(atm);
    }

    @Override
    public List<ATMResponseDTO> getAll() {

        return atmRepository.findAll()
                .stream()
                .map(atmMapper::toDTO)
                .toList();
    }

    @Override
    public Optional<ATMResponseDTO> findById(Long id) {
        return atmRepository.findById(id).map(atmMapper::toDTO);
    }

    @Override
    public void delete(Long id) {
        atmRepository.deleteById(id);
    }

    @Override
    public ATM update(ATMRequestDTO dto, Long id) {

        Branch branch = branchRepository.findById(dto.getBranch().getId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        ATM atm = atmMapper.toEntity(dto, branch);
        atm.setBranch(branch);
        atm.setId(id);

        return atmRepository.save(atm);
    }

}
