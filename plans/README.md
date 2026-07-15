# Implementation Plans

**Generated:** 2026-07-15
**Base commit:** `44740aa`
**Total plans:** 11
**Status:** ALL COMPLETED

## Priority Order

| # | Plan | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 001 | [Fix Cashier WITHDRAW Bug](001-fix-cashier-withdraw-bug.md) | CRITICAL | M | DONE |
| 002 | [Fix Dashboard Branch Filter + OOM](002-fix-dashboard-branch-filter-oom.md) | HIGH | L | DONE |
| 003 | [Externalize Hardcoded Credentials](003-externalize-hardcoded-credentials.md) | CRITICAL | S | DONE |
| 004 | [Fix Profile/KYC Bugs](004-fix-profile-kyc-bugs.md) | MEDIUM | S | DONE |
| 005 | [Remove CVV from CardResponse](005-remove-cvv-from-response.md) | HIGH | S | DONE |
| 006 | [Secure /uploads/ Directory](006-secure-uploads-directory.md) | HIGH | M | DONE |
| 007 | [Fix Password Validation](007-fix-password-validation.md) | MEDIUM | S | DONE |
| 008 | [Add Brute-Force Protection](008-add-brute-force-protection.md) | HIGH | M | DONE |
| 009 | [Fix Duplicate Verification Emails](009-fix-duplicate-verification-emails.md) | MEDIUM | S | DONE |
| 010 | [Add Security Headers](010-add-security-headers.md) | MEDIUM | S | DONE |
| 011 | [Change ddl-auto to validate](011-change-ddl-auto-to-validate.md) | HIGH | S | DONE |

## Dependency Graph

```
001 (Cashier bug) ─── independent, fix first
002 (Dashboard) ───── independent, can run in parallel with 001
003 (Credentials) ─── independent, can run in parallel
004 (Profile/KYC) ─── independent, can run in parallel
005 (CVV) ─────────── independent, can run in parallel
006 (Uploads) ─────── depends on 003 (uses environment apiUrl)
007 (Password) ────── independent, can run in parallel
008 (Brute-force) ─── independent, can run in parallel
009 (Emails) ──────── independent, can run in parallel
010 (Headers) ─────── independent, can run in parallel
011 (ddl-auto) ────── independent, can run in parallel
```

## Execution Order

1. **Plan 001** — Cashier WITHDRAW bug (financial integrity, must fix first)
2. **Plan 003** — Hardcoded credentials (security baseline)
3. **Plan 005** — CVV in response (PCI-DSS violation)
4. **Plan 004** — Profile/KYC bugs (broken UX, quick win)
5. **Plan 007** — Password validation (security)
6. **Plan 009** — Duplicate emails (UX)
7. **Plan 011** — ddl-auto change (risk mitigation)
8. **Plan 010** — Security headers (defense in depth)
9. **Plan 008** — Brute-force protection (security)
10. **Plan 006** — Secure uploads (security)
11. **Plan 002** — Dashboard refactor (performance, largest effort)

## Changes Summary

### Plan 001: Fixed Cashier WITHDRAW bug
- Swapped sender/receiver args in `CashierTransactionServiceImpl.java:89-103`

### Plan 002: Fixed Dashboard Branch Filter + OOM
- Added JPQL aggregate queries to `AccountRepository`, `TransactionRepository`, `LoanRepository`, `CardRepository`
- Rewrote `DashboardService.java` to use SQL aggregations instead of loading all entities
- Branch filtering now works correctly for BRANCH_MANAGER users

### Plan 003: Externalized Credentials
- Changed `application.properties` to use env vars: `${DB_USERNAME}`, `${SMTP_PASSWORD}`, `${JWT_SECRET}`
- Frontend uses `environment.apiUrl` instead of hardcoded `localhost:8085`

### Plan 004: Fixed Profile/KYC Bugs
- Fixed profile upload to use `environment.apiUrl` and `crypto.encryptObject()`
- Fixed KYC status update to use correct API method

### Plan 005: Removed CVV from Response
- Removed CVV field from `CardResponse.java` and `CardMapper.java`

### Plan 006: Secured Uploads Directory
- Changed `SecurityConfig.java` to require authentication for `/uploads/**`

### Plan 007: Fixed Password Validation
- Aligned password validation to 8 characters in `AuthService.java:172`

### Plan 008: Added Brute-Force Protection
- Created `RateLimitConfig.java` with in-memory 5-attempts/15-min lockout
- Added rate limiting to `AuthController.login()`

### Plan 009: Fixed Duplicate Verification Emails
- Removed duplicate verification email send from `AuthService.register()`

### Plan 010: Added Security Headers
- Added CSP, X-Frame-Options, HSTS, X-Content-Type-Options to `SecurityConfig.java`

### Plan 011: Changed ddl-auto to validate
- Changed `spring.jpa.hibernate.ddl-auto` from `update` to `validate`

### Bonus: Fixed CardController Lombok Error
- Replaced `@RequiredArgsConstructor` with explicit constructor injection in `CardController.java`
