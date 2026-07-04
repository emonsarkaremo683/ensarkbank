package com.elitetech_inc.ensarkbank.account_management.account.controller;


import com.elitetech_inc.ensarkbank.account_management.account.dto.request.AccountRequest;
import com.elitetech_inc.ensarkbank.account_management.account.dto.response.AccountResponse;
import com.elitetech_inc.ensarkbank.account_management.account.service.AccountService;
import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/account/")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<AccountResponse> addAccount(
            @RequestPart("data") String data,

            // nominee
            @RequestPart(value = "photo", required = true) MultipartFile photo,
            @RequestPart(value = "nid_front", required = true) MultipartFile nid_front,
            @RequestPart(value = "nid_back", required = true) MultipartFile nid_back
    ){
        AccountRequest dto = objectMapper.readValue(data, AccountRequest.class);

        Map<String, MultipartFile> nominees = new HashMap<>();
        nominees.put("photo", photo);
        nominees.put("nid_front", nid_front);
        nominees.put("nid_back", nid_back);
        return new ResponseEntity<>(accountService.createAccount(dto, nominees), HttpStatus.CREATED);
    }

    @GetMapping("all/")
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {
        return new ResponseEntity<>(accountService.getAccounts(), HttpStatus.OK);
    }

}
