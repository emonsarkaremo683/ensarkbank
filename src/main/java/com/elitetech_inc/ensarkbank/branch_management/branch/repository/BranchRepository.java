package com.elitetech_inc.ensarkbank.branch_management.branch.repository;


import com.elitetech_inc.ensarkbank.branch_management.branch.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    Optional<Branch> findByBranchCode(String branchCode);
    boolean existsByEmail(String email);
    Optional<Branch> findOneByEmail(String email);
    List<Branch> findByParentBranch_Id(Long parentBranchId);
}
