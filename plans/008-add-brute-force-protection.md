# Plan 008: Add Brute-Force Protection on Login

**Commit:** `44740aa`
**Finding:** #11 (HIGH)
**Effort:** M | **Risk:** Low

## Problem

No rate limiting on `/api/auth/login`. Unlimited credential-stuffing attacks are possible.

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank/auth_management/auth/controller/AuthController.java`
- `src/main/java/com/elitetech_inc/ensarkbank/auth_management/auth/serviceimpl/AuthService.java`
- `src/main/java/com/elitetech_inc/ensarkbank/config/RateLimitConfig.java` (new)

**Files NOT to modify:**
- Frontend — no changes needed

## Required Changes

### Step 1: Create RateLimitConfig.java

```java
package com.elitetech_inc.ensarkbank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class RateLimitConfig {

    private final ConcurrentHashMap<String, LoginAttempt> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        LoginAttempt attempt = attempts.get(key);
        if (attempt == null) return false;
        if (attempt.isExpired()) {
            attempts.remove(key);
            return false;
        }
        return attempt.getCount() >= 5;
    }

    public void recordAttempt(String key) {
        attempts.compute(key, (k, v) -> {
            if (v == null || v.isExpired()) return new LoginAttempt();
            v.increment();
            return v;
        });
    }

    public void resetAttempts(String key) {
        attempts.remove(key);
    }

    private static class LoginAttempt {
        private int count = 0;
        private final long createdAt = System.currentTimeMillis();

        void increment() { count++; }
        int getCount() { return count; }
        boolean isExpired() { return System.currentTimeMillis() - createdAt > 900_000; } // 15 min
    }
}
```

### Step 2: Add rate limiting to AuthController login

```java
@Autowired
private RateLimitConfig rateLimitConfig;

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    String key = request.getEmail() + ":" + getClientIp();
    if (rateLimitConfig.isBlocked(key)) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("message", "Too many login attempts. Try again later."));
    }
    try {
        LoginResponse<?> response = authService.login(request);
        rateLimitConfig.resetAttempts(key);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        rateLimitConfig.recordAttempt(key);
        throw e;
    }
}

private String getClientIp() {
    // Get from RequestContextHolder
    return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
            .getRequest().getRemoteAddr();
}
```

## Verification

1. Start backend
2. Attempt 5 failed logins rapidly
3. 6th attempt should return 429 Too Many Requests
4. Wait 15 minutes or restart server
5. Login should work again

## Maintenance Note

- In-memory rate limiting resets on server restart — acceptable for development
- For production, use Redis-backed rate limiting (Bucket4j + Redis)
- Consider adding account lockout after N failed attempts (separate from IP-based rate limiting)
