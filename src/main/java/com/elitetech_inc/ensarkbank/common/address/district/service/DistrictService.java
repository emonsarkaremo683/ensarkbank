package com.elitetech_inc.ensarkbank.common.address.district.service;



import com.elitetech_inc.ensarkbank.common.address.district.entity.District;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface DistrictService {

    District save(District district);
    List<District> findAll();
    Optional<District> findByDistrictId(Long id);
    void delete(Long id);


}
