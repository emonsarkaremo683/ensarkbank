package com.elitetech_inc.ensarkbank.accounting_system.journal.controller;

import com.elitetech_inc.ensarkbank.accounting_system.journal.dto.JournalResponse;
import com.elitetech_inc.ensarkbank.accounting_system.journal.service.JournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/history/")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @GetMapping("{accountNumber}")
    public ResponseEntity<List<JournalResponse>> getByNumber(@PathVariable String accountNumber){
        return ResponseEntity.ok(journalService.getByAccountNumber(accountNumber));
    }
}
