package com.elitetech_inc.ensarkbank.auth_management.auth.controller;

import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.ForgetPasswordRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.LoginRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.ResetPasswordRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.response.LoginResponse;
import com.elitetech_inc.ensarkbank.auth_management.auth.serviceimpl.AuthService;
import com.elitetech_inc.ensarkbank.common.enums.DocumentType;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.request.CustomerRequest;
import com.elitetech_inc.ensarkbank.customer_management.customer.dto.response.CustomerResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.EnumMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ObjectMapper objectMapper;


    @PostMapping("/login")
    public ResponseEntity<LoginResponse<?>> login(@RequestBody LoginRequest dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse<CustomerResponse>> register(@RequestPart("data") String data,
                                                                    @RequestPart(value = "profile", required = false) MultipartFile profilePicture,
                                                                    // KYC document files
                                                                    @RequestPart(value = "NID",               required = false) MultipartFile nid,
                                                                    @RequestPart(value = "PASSPORT",          required = false) MultipartFile passport,
                                                                    @RequestPart(value = "DRIVING_LICENSE",   required = false) MultipartFile drivingLicense,
                                                                    @RequestPart(value = "BIRTH_CERTIFICATE", required = false) MultipartFile birthCertificate

    ) throws Exception {

        CustomerRequest dto = objectMapper.readValue(data, CustomerRequest.class);

        Map<DocumentType, MultipartFile> documents = new EnumMap<>(DocumentType.class);

        if (nid != null && !nid.isEmpty()) documents.put(DocumentType.NID, nid);
        if (passport != null && !passport.isEmpty()) documents.put(DocumentType.PASSPORT, passport);
        if (drivingLicense != null && !drivingLicense.isEmpty()) documents.put(DocumentType.DRIVING_LICENSE, drivingLicense);
        if (birthCertificate != null && !birthCertificate.isEmpty()) documents.put(DocumentType.BIRTH_CERTIFICATE, birthCertificate);
        return ResponseEntity.ok(authService.register(dto, profilePicture, documents));
    }


    // GET /api/auth/verify-email?token=...
    // User clicks this link from their email
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully. You can now log in.");
    }

    // POST /api/auth/send-verification
    // Body: { "email": "user@example.com" }
    @PostMapping("/send-verification")
    public ResponseEntity<String> sendVerification(@RequestBody ForgetPasswordRequest dto) {
        authService.sendVerificationEmail(dto.getEmail());
        return ResponseEntity.ok("Verification email sent to " + dto.getEmail());
    }

    // ── Password reset ──────────────────────────────────────────────

    // POST /api/auth/forgot-password
    // Body: { "email": "fatema@gmail.com" }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgetPasswordRequest dto) {
        authService.forgotPassword(dto);
        return ResponseEntity.ok("Password reset link sent to " + dto.getEmail());
    }

    // POST /api/auth/reset-password
    // Body: { "token": "...", "newPassword": "newPass123" }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest dto) {
        authService.resetPassword(dto);
        return ResponseEntity.ok("Password reset successful. You can now log in with your new password.");
    }



}