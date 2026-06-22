package com.elitetech_inc.ensarkbank.branch.repository;


import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {

}
