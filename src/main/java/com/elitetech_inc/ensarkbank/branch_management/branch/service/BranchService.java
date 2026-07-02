package com.elitetech_inc.ensarkbank.branch_management.branch.service;

import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch_management.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.common.enums.BranchStatus;
import com.elitetech_inc.ensarkbank.util.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final Utils utils;

    public Branch createBranch(Branch branch) {
        branch.setBranchCode(generateBranchCode(branch.getName()));
        branch.setRoutingNumber(utils.generateRouteNumber());
        if (branch.getStatus() == null) branch.setStatus(BranchStatus.ACTIVE);
        return branchRepository.save(branch);
    }

    public Branch updateBranch(Long id, Branch updated) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch"+ id));
        branch.setName(updated.getName());
        branch.setAddress(updated.getAddress());
        branch.setEmail(updated.getEmail());
        branch.setPhoneNumber(updated.getPhoneNumber());
        branch.setStatus(updated.getStatus());
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
