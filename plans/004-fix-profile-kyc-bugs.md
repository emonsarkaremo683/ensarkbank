# Plan 004: Fix Profile Update + KYC Status Update Bugs

**Commit:** `44740aa`
**Finding:** #8, #9, #13 (MEDIUM)
**Effort:** S | **Risk:** Low

## Problem

1. **Profile update calls wrong endpoint** (`profile.component.ts:98`): Uses `updateCustomer(id, formData)` which hits `PUT /api/customer/{id}` expecting `@RequestPart("data")`. Should use dedicated `/profile` endpoint.
2. **Profile update writes plaintext to localStorage** (`profile.component.ts:103,123`): Uses `JSON.stringify(updatedUser)` instead of `crypto.encryptObject()`, causing logout on refresh.
3. **KYC status update calls wrong endpoint** (`customers.component.ts:83`): Uses `updateCustomer(id, {...customer, kycStatus})` instead of `updateKycStatus(id, status)`.

## Scope

**Files to modify:**
- `ensarkbank-frontend/src/app/pages/profile/profile.component.ts`
- `ensarkbank-frontend/src/app/pages/customers/customers.component.ts`
- `ensarkbank-frontend/src/app/core/services/api.service.ts`

**Files NOT to modify:**
- Backend controllers — endpoints already exist

## Required Changes

### Step 1: Fix profile.component.ts — customer profile upload

**Line 98** — change from:
```typescript
this.api.updateCustomer(currentUser.id, formData).subscribe({
```
to:
```typescript
this.api.updateCustomerProfile(currentUser.id, formData).subscribe({
```

**Lines 101-103** — change from:
```typescript
const imageUrl = 'http://localhost:8085/uploads/customer/' + res.profile;
const updatedUser = { ...this.auth.currentUser(), profile: res.profile, imageUrl };
localStorage.setItem('bank_user', JSON.stringify(updatedUser));
```
to:
```typescript
const imageUrl = `${environment.apiUrl.replace('/api', '')}/uploads/customer/${res.profile}`;
const updatedUser = { ...this.auth.currentUser(), profile: res.profile, imageUrl };
localStorage.setItem('bank_user', this.crypto.encryptObject(updatedUser));
```

Add imports at top:
```typescript
import { environment } from '../../../environments/environment';
import { CryptoService } from '../../core/services/crypto.service';
```

Inject in constructor:
```typescript
private crypto: CryptoService,
```

### Step 2: Fix profile.component.ts — employee profile upload

**Line 118** — change from:
```typescript
this.api.updateEmployee(currentUser.id, formData).subscribe({
```
to:
```typescript
this.api.updateEmployeeProfile(currentUser.id, formData).subscribe({
```

**Lines 120-123** — same pattern as customer: use `environment.apiUrl` and `crypto.encryptObject()`.

### Step 3: Add API methods to api.service.ts

Add after existing employee methods:
```typescript
updateCustomerProfile(id: number, formData: FormData): Observable<CustomerResponse> {
  return this.http.put<CustomerResponse>(`${this.BASE}/customer/${id}/profile`, formData);
}
updateEmployeeProfile(id: number, formData: FormData): Observable<EmployeeResponse> {
  return this.http.put<EmployeeResponse>(`${this.BASE}/employee/${id}/profile`, formData);
}
```

### Step 4: Fix customers.component.ts — KYC status update

**Line 83** — change from:
```typescript
this.api.updateCustomer(customer.id, { ...customer as any, kycStatus: newStatus }).subscribe({
```
to:
```typescript
this.api.updateKycStatus(customer.id, newStatus).subscribe({
```

## Verification

1. Login as customer, go to Profile
2. Upload a profile picture
3. Refresh the page — should stay logged in (not redirected to login)
4. Login as staff, go to Customers
5. Change a customer's KYC status
6. Verify status updates correctly

## Maintenance Note

- The `updateCustomerProfile` and `updateEmployeeProfile` methods must match the backend endpoints `PUT /api/customer/{id}/profile` and `PUT /api/employee/{id}/profile`
- The `environment.apiUrl.replace('/api', '')` pattern is needed because `environment.apiUrl` includes `/api` but file URLs don't
