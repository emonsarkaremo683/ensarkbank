package com.elitetech_inc.ensarkbank.customer_management.beneficiary.controller;

import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.request.BeneficiaryRequest;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.dto.response.BeneficiaryResponse;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.entity.Beneficiary;
import com.elitetech_inc.ensarkbank.customer_management.beneficiary.service.BeneficiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/beneficiary/")
@RequiredArgsConstructor
public class BeneficiaryController {
    private final BeneficiaryService beneficiaryService;

    @PostMapping
    public ResponseEntity<BeneficiaryResponse> create(@RequestBody BeneficiaryRequest b){
        return ResponseEntity.ok(beneficiaryService.save(b));
    }

    @GetMapping
    public ResponseEntity<List<BeneficiaryResponse>> findAll(){
        return ResponseEntity.ok(beneficiaryService.getAll());
    }

    @GetMapping("{id}")
    public ResponseEntity<Optional<BeneficiaryResponse>> findById(@PathVariable Long id){
        return ResponseEntity.ok(beneficiaryService.findById(id));
    }

    @GetMapping("customer/{id}")
    public ResponseEntity<List<BeneficiaryResponse>> findByCustomerId(@PathVariable Long id){
        return ResponseEntity.ok(beneficiaryService.findByCustomerId(id));
    }
}
