package com.elitetech_inc.ensarkbank.common.address.division.controller;



import com.elitetech_inc.ensarkbank.common.address.division.entity.Division;
import com.elitetech_inc.ensarkbank.common.address.division.service.DivisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/division/")
@PreAuthorize("hasAnyRole(ADMIN, SUPER_ADMIN)")
public class DivisionController {

    @Autowired
    private DivisionService divisionService;



    @PostMapping
    public ResponseEntity<Division> save(@RequestBody Division division){

        return new ResponseEntity<>(divisionService.save(division), HttpStatus.OK);
    }

    @PreAuthorize("hasAllRoles()")
    @GetMapping
    public ResponseEntity<List<Division>> findAll(){
        return new ResponseEntity<>(divisionService.findAll(), HttpStatus.OK);
    }

    @PreAuthorize("hasAllRoles()")
    @GetMapping("{id}")
    public ResponseEntity<Division> findById(@PathVariable Long id){
        Division d = divisionService.findByDivisionId(id).orElseThrow(
                ()-> new RuntimeException("Division with id " + id + " not found")
        );
        return new ResponseEntity<>(d, HttpStatus.OK);
    }


    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteById(@PathVariable Long id){
        divisionService.delete(id);
        return new ResponseEntity<>("Division with id " + id + " deleted", HttpStatus.OK);
    }


}
