package com.elitetech_inc.ensarkbank.branch.serviceimpl;


import com.elitetech_inc.ensarkbank.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.address.policestation.repository.PoliceStationRepository;
import com.elitetech_inc.ensarkbank.branch.dto.mapper.BranchMapper;
import com.elitetech_inc.ensarkbank.branch.dto.request.BranchRequest;
import com.elitetech_inc.ensarkbank.branch.dto.response.BranchResponse;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.branch.service.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;


@Service
public class BranchServiceImpl implements BranchService {

    @Autowired
    private PoliceStationRepository policeStationRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BranchMapper branchMapper;

    @Override
    public BranchResponse save(BranchRequest br) {
        if (br.getPoliceStation() != null && br.getPoliceStation().getId() != null) {
            PoliceStation ps = policeStationRepository.findById(br.getPoliceStation().getId())
                    .orElseThrow(
                            ()-> new RuntimeException("No Police Station found"));
            br.setPoliceStation(ps);
        } else {
            throw new RuntimeException("Police Station is required");
        }
        Branch branch = new Branch();
        branch = branchMapper.toBranch(br);
        branch.setRoutingNumber(generateRouteNumber());

       return branchMapper.toBranchResponse(branchRepository.save(branch));
    }

    @Override
    public List<BranchResponse> getAll() {
        return branchRepository.findAll()
                .stream()
                .map(branchMapper::toBranchResponse)
                .collect(Collectors.toList());
    }



    @Override
    public Optional<BranchResponse> findById(Long id) {
        return branchRepository.findById(id)
                .stream()
                .map(branchMapper::toBranchResponse)
                .findFirst();

    }

    @Override
    public void delete(Long id) {
        branchRepository.deleteById(id);
    }




    private String generateRouteNumber(){
        final String fixedRoute = "6830";
        String randomPart = String.format("%05d",
                new Random().nextInt(100000));
        String accNumber = fixedRoute + randomPart;
        return accNumber;
    }


}
