package com.elitetech_inc.ensarkbank.branch.dto.mapper;


import com.elitetech_inc.ensarkbank.branch.dto.request.BranchRequest;
import com.elitetech_inc.ensarkbank.branch.dto.response.BranchResponse;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import org.springframework.stereotype.Component;

@Component
public class BranchMapper {
    public BranchResponse toBranchResponse(Branch branch) {
        BranchResponse br = new BranchResponse();
        br.setBranchNumber(branch.getBranchNumber());
        br.setEmail(branch.getEmail());
        br.setCash_vault(branch.getCash_vault());
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
        branch.setCash_vault(branchRequest.getCash_vault());
        branch.setEmail(branchRequest.getEmail());
        branch.setAddress(branchRequest.getAddress());
        branch.setType(branchRequest.getType());
        branch.setStatus(branchRequest.getStatus());
        branch.setPoliceStation(branchRequest.getPoliceStation());
        branch.setName(branchRequest.getBranchName());
        return branch;
    }
}
