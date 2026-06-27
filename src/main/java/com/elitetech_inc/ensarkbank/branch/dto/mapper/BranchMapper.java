package com.elitetech_inc.ensarkbank.branch.dto.mapper;


import com.elitetech_inc.ensarkbank.branch.dto.request.BranchRequest;
import com.elitetech_inc.ensarkbank.branch.dto.response.BranchResponse;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component

public class BranchMapper {
    @Autowired
    private AccountRepository accountRepository;

    public BranchResponse toBranchResponse(Branch branch) {
        BranchResponse br = new BranchResponse();
        br.setBranchNumber(branch.getBranchNumber());
        br.setEmail(branch.getEmail());
        br.setCash_vault(getBalance("br-" + branch.getRoutingNumber()));
        br.setAddress(branch.getAddress());
        br.setType(branch.getType());
        br.setStatus(branch.getStatus());
        br.setRoutingNumber(branch.getRoutingNumber());
        br.setBranchID(branch.getId());
        br.setBranchName(branch.getName());

        return br;
    }

    public Branch toBranch(BranchRequest branchRequest) {
        Branch branch = new Branch();
        branch.setBranchNumber(branchRequest.getBranchNumber());
        branch.setEmail(branchRequest.getEmail());
        branch.setAddress(branchRequest.getAddress());
        branch.setType(branchRequest.getType());
        branch.setStatus(branchRequest.getStatus());
        branch.setPoliceStation(branchRequest.getPoliceStation());
        branch.setName(branchRequest.getBranchName());
        return branch;
    }

    private Double getBalance(String account) {
        Account acc = accountRepository.findByAccNumber(account).orElseThrow();
        return acc.getAvailableBalance();
    }

}
