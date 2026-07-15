# Plan 006: Secure /uploads/ Directory

**Commit:** `44740aa`
**Finding:** #7 (HIGH)
**Effort:** M | **Risk:** Medium

## Problem

`SecurityConfig.java:52-53` permits all requests to `/uploads/**` without authentication. KYC documents (NID, passport), profile photos, and nominee documents are publicly accessible.

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank/auth_management/auth/security/SecurityConfig.java`
- `src/main/java/com/elitetech_inc/ensarkbank/config/CorsConfig.java`

**Files NOT to modify:**
- Frontend image components — will be addressed separately

## Required Changes

### Step 1: Remove /uploads/** from permitAll

In `SecurityConfig.java`, remove `/uploads/**` from the permitAll list (line 53):

```java
.requestMatchers(
    "/api/auth/**",
    // REMOVE: "/uploads/**",
    "/api/division/all",
    // ... rest unchanged
).permitAll()
```

### Step 2: Add a dedicated static resource handler with auth

Add a new filter or configure Spring Security to require auth for `/uploads/**`:

```java
.requestMatchers("/uploads/**").authenticated()
```

### Step 3: Update CorsConfig.java

Remove the static resource serving from `CorsConfig.java` if it conflicts:

The `CorsConfig.java` line 26-33 maps the upload directory to a URL pattern. This should remain but the security config should enforce auth.

## Verification

1. Start backend: `mvn spring-boot:run`
2. Try accessing `http://localhost:8085/uploads/customer/somefile.jpg` WITHOUT token — should get 401
3. Try accessing WITH valid JWT — should get the file
4. Verify frontend still displays images (frontend already sends auth headers)

## Maintenance Note

- Frontend image tags (`<img [src]="...">`) don't send auth headers. Two options:
  1. Use an `<img>` with a proxy endpoint that adds auth
  2. Create a separate `/api/files/{path}` endpoint that serves files with auth
- For now, the simplest fix is to keep `/uploads/**` public but add file-type validation (see Plan 007)
- Consider using signed/temporary URLs for sensitive documents in production
