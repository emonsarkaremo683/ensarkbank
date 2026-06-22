package com.elitetech_inc.ensarkbank.address.policestation.service;


import com.elitetech_inc.ensarkbank.address.policestation.entity.PoliceStation;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
public interface PoliceStationService {



    public PoliceStation save(PoliceStation policeStation);
    public List<PoliceStation> getAll() ;
    public void delete(Long id);
    public Optional<PoliceStation> findById(Long id);



}
