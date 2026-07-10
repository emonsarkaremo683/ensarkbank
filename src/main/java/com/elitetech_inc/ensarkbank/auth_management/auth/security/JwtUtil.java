package com.elitetech_inc.ensarkbank.auth_management.auth.security;

import com.elitetech_inc.ensarkbank.common.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey; // Changed from java.security.Key
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    @Value("${jwt.verification-expiration}")
    private long verificationExpiration;


    @Value("${jwt.reset-expiration}")
    private long resetExpiration;

    public String generateToken(String email, Role role){
        return Jwts.builder()
                .subject(email)                         // Replaces setSubject()
                .claim("role", role.name())            // Converts Enum to String for clean JSON serialization
                .issuedAt(new Date())  // Replaces setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + expiration)) // Replaces setExpiration()
                .signWith(getKey())                     // Replaces signWith(key, algorithm)
                .compact();
    }

    // ── Password reset token (short-lived, single purpose) ─────────
    public String generateResetToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("purpose", "PASSWORD_RESET")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + resetExpiration))
                .signWith(getKey())
                .compact();
    }

    // ── Email verification token (short-lived, single purpose) ────
    public String generateVerificationToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("purpose", "EMAIL_VERIFICATION")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + verificationExpiration))
                .signWith(getKey())
                .compact();
    }



    // get Email
    public String getEmail(String token){
        return (String) getClaims(token).getSubject();
    }

    // Get Role
    public Role getRole(String token){
        return (Role) getClaims(token).get("role");
    }

    // Validate token — checks signature + expiry
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }


    public String extractPurpose(String token) {
        return (String) getClaims(token).get("purpose");
    }


    // Validates token AND checks it was issued for the expected purpose
    public boolean isValidForPurpose(String token, String expectedPurpose) {
        try {
            Claims claims = getClaims(token);
            return expectedPurpose.equals(claims.get("purpose"));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }


// old code
//    private Claims  getClaims(String token){
//        return Jwts.parser()
//                .setSigningKey(getKey())
//                .build()
//                .parseClaimsJws(token)
//                .getBody();
//    }

    // updated code

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getKey(){
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
