package com.elitetech_inc.ensarkbank.atm_management.atm_transaction;

import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionRequest;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.ATMTransactionResponse;
import com.elitetech_inc.ensarkbank.atm_management.atm_transaction.dto.BalanceCheckRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/atm-transactions")
@RequiredArgsConstructor
public class ATMTransactionController {

    private final ATMTransactionService atmTransactionService;

    @PostMapping
    public ResponseEntity<ATMTransactionResponse> transaction(@RequestBody ATMTransactionRequest request) {
        return ResponseEntity.ok(atmTransactionService.transaction(request));
    }

    @PostMapping("/{atmId}/refill")
    public ResponseEntity<ATMTransactionResponse> refill(
            @PathVariable Long atmId,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(atmTransactionService.refill(atmId, amount));
    }

    @GetMapping
    public ResponseEntity<List<ATMTransactionResponse>> getAll() {
        return ResponseEntity.ok(atmTransactionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ATMTransactionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(atmTransactionService.getById(id));
    }

    @GetMapping("/atm/{atmId}")
    public ResponseEntity<List<ATMTransactionResponse>> getByAtmId(@PathVariable Long atmId) {
        return ResponseEntity.ok(atmTransactionService.getByAtmId(atmId));
    }

    @PostMapping("/balance")
    public ResponseEntity<BigDecimal> checkBalance(@RequestBody BalanceCheckRequest request) {
        return ResponseEntity.ok(
                atmTransactionService.checkBalance(request.getCardNumber(), request.getPin()));
    }
}
