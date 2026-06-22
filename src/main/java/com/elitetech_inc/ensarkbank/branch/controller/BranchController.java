package com.elitetech_inc.ensarkbank.branch.controller;


import com.elitetech_inc.ensarkbank.branch.dto.request.BranchRequest;
import com.elitetech_inc.ensarkbank.branch.dto.response.BranchResponse;
import com.elitetech_inc.ensarkbank.branch.service.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branch/")
public class BranchController {

    @Autowired
    private BranchService branchService;

    @PostMapping
    public ResponseEntity<BranchResponse> save(@RequestBody BranchRequest branch){
        BranchResponse b = branchService.save(branch);
        return new ResponseEntity<>(b, HttpStatus.CREATED);
    }


    @GetMapping("")
    public List<BranchResponse> getAll(){
        return branchService.getAll();
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> delete(@PathVariable Long id){
        branchService.delete(id);
        return new ResponseEntity<>("Data deleted" ,HttpStatus.OK);
    }

    @GetMapping("{id}")
    public ResponseEntity<BranchResponse> getById(@PathVariable Long id){
        BranchResponse ps = branchService.findById(id).orElseThrow(
                () -> new RuntimeException("Data not found")
        );
        return new ResponseEntity<>(ps, HttpStatus.OK);
    }




}
