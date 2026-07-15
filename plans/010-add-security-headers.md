# Plan 010: Add Security Headers

**Commit:** `44740aa`
**Finding:** #15 (MEDIUM)
**Effort:** S | **Risk:** Low

## Problem

No HTTP security headers configured: CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy.

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank/auth_management/auth/security/SecurityConfig.java`

**Files NOT to modify:**
- Frontend

## Required Changes

### Step 1: Add security headers to SecurityFilterChain

In `SecurityConfig.java`, add headers configuration before the `return http.build();` line:

```java
http
    .headers(headers -> headers
        .contentTypeOptions(contentType -> {})
        .frameOptions(frame -> frame.deny())
        .xssProtection(xss -> {})
        .httpStrictTransportSecurity(hsts -> hsts
            .includeSubDomains(true)
            .maxAgeInSeconds(31536000)
        )
        .contentSecurityPolicy(csp -> csp
            .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://localhost:8085")
        )
        .referrerPolicy(referrer -> referrer
            .policy(org.springframework.security.web.header.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
        )
    )
```

## Verification

1. Start backend
2. Make a request: `curl -v http://localhost:8085/api/auth/login`
3. Check response headers for:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `Content-Security-Policy: default-src 'self'; ...`
   - `Referrer-Policy: strict-origin-when-cross-origin`

## Maintenance Note

- CSP `img-src` must include `http://localhost:8085` for profile images to load in development
- For production, update CSP to use the production domain
- `frame-options: deny` prevents clickjacking
- HSTS requires HTTPS in production
