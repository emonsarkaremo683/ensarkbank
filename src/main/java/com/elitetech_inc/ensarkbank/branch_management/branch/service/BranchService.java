package com.elitetech_inc.ensarkbank.branch_management.branch.service;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import com.elitetech_inc.ensarkbank.account_management.account.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.account_management.account_holder.entity.AccountHolder;
import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.common.address.policestation.repository.PoliceStationRepository;
import com.elitetech_inc.ensarkbank.common.enums.*;
import com.elitetech_inc.ensarkbank.util.AccountNumberGenerator;
import com.elitetech_inc.ensarkbank.util.RequestValidator;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final Utils utils;
    private final AccountNumberGenerator accountNumberGenerator;
    private final AccountRepository accountRepository;
    private final RequestValidator requestValidator;
    private final PoliceStationRepository policeStationRepository;

    @Transactional
    public Branch createBranch(Branch branch) {
        requestValidator.validateBranch(branch);
        branch.setBranchCode(generateBranchCode(branch.getName()));
        branch.setRoutingNumber(utils.generateRouteNumber());
        if (branch.getStatus() == null) branch.setStatus(BranchStatus.ACTIVE);

        if (branch.getType() == BranchType.AGENT_BANK && branch.getParentBranch() != null
                && branch.getParentBranch().getId() != null) {
            Branch parent = branchRepository.findById(branch.getParentBranch().getId())
                    .orElseThrow(() -> new RuntimeException("Parent branch not found: " + branch.getParentBranch().getId()));
            branch.setParentBranch(parent);
        }

        if (branch.getPoliceStation() != null && branch.getPoliceStation().getId() != null) {
            PoliceStation ps = policeStationRepository.findById(branch.getPoliceStation().getId())
                    .orElseThrow(() -> new RuntimeException("Police station not found: " + branch.getPoliceStation().getId()));
            branch.setPoliceStation(ps);
        }

        Branch br = branchRepository.save(branch);
        Account ar = new Account();
        boolean isAgentBank = br.getType() == BranchType.AGENT_BANK;
        boolean isHeadOffice = br.getType() == BranchType.HEAD_OFFICE;
        BigDecimal initialBalance = isHeadOffice
                ? BigDecimal.valueOf(10000000.00)
                : BigDecimal.valueOf(5000000.00);
        if (!isAgentBank){

            ar.setBranch(br);
            ar.setAccountStatus(AccountStatus.ACTIVE);
            ar.setAccountType(isHeadOffice? AccountType.INTER_BANK_VAULT: AccountType.BRANCH_VAULT);
            ar.setAvailableBalance(initialBalance);
            ar.setAccountNumber(accountNumberGenerator.generateBranchAccountNumber(br.getRoutingNumber(),
                    isHeadOffice ? "head-" : "br-"));
            ar.setCurrentBalance(initialBalance);
            ar.setHoldBalance(BigDecimal.ZERO);

            AccountHolder ahr = new AccountHolder();
            ahr.setCanWithdraw(true);
            ahr.setCanDeposit(true);
            ahr.setCanApproveTransaction(true);
            ahr.setHolderType(HolderType.INTER_BRANCH_SETTLEMENT);

            ar.setHolders(new ArrayList<>());
            ar.getHolders().add(ahr);
        }

        accountRepository.save(ar);

        return br;
    }

    public Branch updateBranch(Long id, Branch updated) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch"+ id));
        requestValidator.validateBranch(updated);
        branch.setName(updated.getName());
        branch.setAddress(updated.getAddress());
        branch.setEmail(updated.getEmail());
        branch.setPhoneNumber(updated.getPhoneNumber());
        branch.setStatus(updated.getStatus());

        if (updated.getPoliceStation() != null && updated.getPoliceStation().getId() != null) {
            PoliceStation ps = policeStationRepository.findById(updated.getPoliceStation().getId())
                    .orElseThrow(() -> new RuntimeException("Police station not found: " + updated.getPoliceStation().getId()));
            branch.setPoliceStation(ps);
        }

        return branchRepository.save(branch);
    }

    public Branch getBranchById(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch"+ id));
    }

    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    private String generateBranchCode(String name) {
        String prefix = name.substring(0, Math.min(3, name.length())).toUpperCase();
        return prefix + String.format("%04d", new Random().nextInt(10000));
    }
}
