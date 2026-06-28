package com.elitetech_inc.ensarkbank.atm.service;

import com.elitetech_inc.ensarkbank.atm.dto.mapper.AtmMapper;
import com.elitetech_inc.ensarkbank.atm.dto.request.AtmRequest;
import com.elitetech_inc.ensarkbank.atm.dto.response.AtmResponse;
import com.elitetech_inc.ensarkbank.atm.entity.ATM;
import com.elitetech_inc.ensarkbank.atm.repository.ATMRepository;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.enums.AccountStatus;
import com.elitetech_inc.ensarkbank.enums.AccountType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AtmServiceImpl implements AtmService {
    private final BranchRepository branchRepository;
    private final ATMRepository atmRepository;
    private final AccountRepository accountRepository;
    private final AtmMapper atmMapper;

    @Override
    public AtmResponse createAtm(AtmRequest atmRequest) {

        // Finding Branch
        Branch b = branchRepository.findById(atmRequest.getBranch().getId()).orElse(null);

        // Create ATM
        ATM atm = atmMapper.toATM(atmRequest);
        atm.setBranch(b);

        // Create Account for ATM
        Account acc = new Account();
        acc.setBranch(b);
        acc.setAccNumber("atm-" + atm.getAtmRouting());
        acc.setType(AccountType.ATM_VAULT);
        acc.setAccountStatus(AccountStatus.ACTIVE);
        acc.setAvailableBalance(atmRequest.getBalance());
        acc.setCurrentBalance(atmRequest.getBalance());
        acc.setHoldBalance(0.0);

        accountRepository.save(acc);
        atm.setAccount(acc);
        return atmMapper.toResponse(atmRepository.save(atm));


    }
}
