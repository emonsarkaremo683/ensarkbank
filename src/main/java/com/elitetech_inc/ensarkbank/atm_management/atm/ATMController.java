package com.elitetech_inc.ensarkbank.atm_management.atm;

import com.elitetech_inc.ensarkbank.atm_management.atm.dto.ATMRequest;
import com.elitetech_inc.ensarkbank.atm_management.atm.dto.ATMResponse;
import com.elitetech_inc.ensarkbank.common.enums.ATMStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/atm")
@RequiredArgsConstructor
public class ATMController {


    private final ATMService atmService;

    @PostMapping
    public ResponseEntity<ATMResponse> addATM(@RequestBody ATMRequest atm) {
        return ResponseEntity.ok(atmService.createATM(atm));
    }

    @PutMapping("update/{id}")
    public ResponseEntity<ATMResponse> updateATM(@PathVariable Long id, @RequestBody ATMRequest atm) {
        return ResponseEntity.ok(atmService.updateATM(id, atm));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ATMResponse> updateATMStatus(
            @PathVariable Long id,
            @RequestParam ATMStatus status) {
        return ResponseEntity.ok(atmService.outOfServiceATM(id, status));
    }

    @GetMapping("{id}")
    public ResponseEntity<Optional<ATMResponse>> getATM(@PathVariable Long id) {
        return ResponseEntity.ok(atmService.getATM(id));
    }

    @GetMapping("branch/{id}")
    public ResponseEntity<List<ATMResponse>> getATMByBranchId(@PathVariable Long id) {
        return ResponseEntity.ok(atmService.getATMByBranchId(id));
    }

    @GetMapping("all")
    public ResponseEntity<List<ATMResponse>> getATM() {
        return ResponseEntity.ok(atmService.getAll());
    }


}
