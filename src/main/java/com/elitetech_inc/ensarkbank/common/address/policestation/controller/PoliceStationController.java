package com.elitetech_inc.ensarkbank.common.address.policestation.controller;


import com.elitetech_inc.ensarkbank.common.address.district.entity.District;
import com.elitetech_inc.ensarkbank.common.address.district.repository.DistrictRepository;
import com.elitetech_inc.ensarkbank.common.address.policestation.entity.PoliceStation;
import com.elitetech_inc.ensarkbank.common.address.policestation.service.PoliceStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policestation/")
public class PoliceStationController {

    @Autowired
    private PoliceStationService policeStationService;

    @Autowired
    private DistrictRepository districtRepository;

    @PostMapping("")
    public ResponseEntity<PoliceStation> save(@RequestBody PoliceStation policeStation) {
        District district = districtRepository.findById(policeStation.getDistrict().getId())
                .orElseThrow(
                        ()-> new RuntimeException("no")
                );
        policeStation.setDistrict(district);
        PoliceStation ps =   policeStationService.save(policeStation);
      return new ResponseEntity<>(ps, HttpStatus.CREATED);
    }

    @GetMapping("")
    public List<PoliceStation> getAll(){
        return policeStationService.getAll();
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> delete(@PathVariable Long id){

        policeStationService.delete(id);
        return new ResponseEntity<>("Data deleted" ,HttpStatus.OK);
    }

    @GetMapping("{id}")
    public ResponseEntity<PoliceStation> getById(@PathVariable Long id){
        PoliceStation ps = policeStationService.findById(id).orElseThrow(
                () -> new RuntimeException("Data not found")
        );
        return new ResponseEntity<>(ps, HttpStatus.OK);
    }

    @PostMapping("{id}")
    public ResponseEntity<PoliceStation> update(@PathVariable Long id, @RequestBody PoliceStation policeStation) {
        policeStation.setId(id);
        PoliceStation ps =   policeStationService.save(policeStation);
        return new ResponseEntity<>(ps, HttpStatus.OK);
    }



}
