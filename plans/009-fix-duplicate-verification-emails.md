# Plan 009: Fix Duplicate Verification Emails on Registration

**Commit:** `44740aa`
**Finding:** #12 (MEDIUM)
**Effort:** S | **Risk:** Low

## Problem

Registration sends two verification emails:
1. `CustomerServiceImpl.saveData()` (line 122-128) sends email
2. `AuthService.register()` (lines 198-204) sends email

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank/auth_management/auth/serviceimpl/AuthService.java`

**Files NOT to modify:**
- `CustomerServiceImpl.java` — keep the email sending there since it's the canonical save method

## Required Changes

### Step 1: Remove duplicate email send from AuthService.register()

In `AuthService.java`, find the register method (around lines 186-220). Remove the email sending block that comes AFTER `customerService.saveData()`:

```java
// REMOVE THIS BLOCK (lines ~198-204):
try {
    emailConfig.sendVerificationEmail(dto.getEmail(), token);
} catch (MessagingException e) {
    throw new RuntimeException("Failed to send verification email: " + e.getMessage());
}
```

The `customerService.saveData()` call already handles sending the verification email.

## Verification

1. Register a new customer
2. Check email inbox — should receive exactly ONE verification email
3. Verify the email contains a valid verification link

## Maintenance Note

- The email sending logic in `CustomerServiceImpl.saveData()` is the correct location since it's called from both registration and customer creation flows
- If `saveData()` fails to send the email, the customer is still created — consider adding retry logic
