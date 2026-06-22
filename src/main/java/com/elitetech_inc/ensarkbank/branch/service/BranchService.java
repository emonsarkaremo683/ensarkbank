package com.elitetech_inc.ensarkbank.branch.service;


import com.elitetech_inc.ensarkbank.branch.dto.request.BranchRequest;
import com.elitetech_inc.ensarkbank.branch.dto.response.BranchResponse;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public interface BranchService {
    BranchResponse save(BranchRequest branch);
    List<BranchResponse> getAll();
    Optional<BranchResponse> findById(Long id);
    void delete(Long id);

}
