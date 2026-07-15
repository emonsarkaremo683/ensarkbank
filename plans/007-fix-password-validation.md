# Plan 007: Fix Password Validation Inconsistency

**Commit:** `44740aa`
**Finding:** #10 (MEDIUM)
**Effort:** S | **Risk:** Low

## Problem

Three different minimum password lengths:
- Backend `AuthService.java:172`: `length < 4` (enforces 4)
- Backend error message: "Password must be at least 8 characters"
- Frontend `register.component.ts:108`: `Validators.minLength(6)`

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank/auth_management/auth/serviceimpl/AuthService.java`

**Files NOT to modify:**
- Frontend — keep at 6 for now, or update to match backend

## Required Changes

### Step 1: Align backend validation to 8 characters

In `AuthService.java:172`, change:
```java
if (dto.getNewPassword() == null || dto.getNewPassword().length() < 4) {
    throw new RuntimeException("Password must be at least 8 characters");
}
```
to:
```java
if (dto.getNewPassword() == null || dto.getNewPassword().length() < 8) {
    throw new RuntimeException("Password must be at least 8 characters");
}
```

### Step 2: Update frontend to match

In `register.component.ts:108`, change:
```typescript
password: ['', [Validators.required, Validators.minLength(6)]],
```
to:
```typescript
password: ['', [Validators.required, Validators.minLength(8)]],
```

In `forgot-password` or `reset-password` components, update similarly.

## Verification

1. Try resetting password with 7 characters — should fail with "at least 8 characters"
2. Try with 8 characters — should succeed
3. Try registering with 7 characters — frontend should show validation error

## Maintenance Note

- Consider adding complexity requirements (uppercase, lowercase, digit, special char) for a banking application
- The backend should be the source of truth for password policy
