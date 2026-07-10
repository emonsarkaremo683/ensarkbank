package com.elitetech_inc.ensarkbank.auth_management.auth.controller;

import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.ForgetPasswordRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.LoginRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.request.ResetPasswordRequest;
import com.elitetech_inc.ensarkbank.auth_management.auth.dto.response.LoginResponse;
import com.elitetech_inc.ensarkbank.auth_management.auth.serviceimpl.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login
    // Body: { "email": "karim@courier.bd", "password": "karim123" }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse<?>> login(@RequestBody LoginRequest dto) {
        return ResponseEntity.ok(authService.login(dto));
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