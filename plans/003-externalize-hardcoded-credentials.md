# Plan 003: Externalize Hardcoded Credentials

**Commit:** `44740aa`
**Finding:** #3 (CRITICAL)
**Effort:** S | **Risk:** Low

## Problem

Hardcoded credentials committed to source control:
- `application.properties:7` — DB password `spring.datasource.password=1234`
- `application.properties:29` — SMTP password `spring.mail.password=imdt enbz phon hrqo`
- `application.properties:39` — JWT secret `jwt.secret=683OrRNRpi677482ta57R8662OI143eM`
- `crypto.service.ts:6` — AES key `EnsarBank@SecureKey2024!@#$%^&*()_+`
- `environment.ts:5` — same AES key

## Scope

**Files to modify:**
- `src/main/resources/application.properties`
- `src/main/java/com/elitetech_inc/ensarkbank/config/EnvConfig.java` (new)
- `ensarkbank-frontend/src/environments/environment.ts`
- `ensarkbank-frontend/src/environments/environment.prod.ts`
- `ensarkbank-frontend/src/app/core/services/crypto.service.ts`

**Files NOT to modify:**
- Any controller or service files

## Required Changes

### Step 1: Backend — use environment variables

Replace hardcoded values in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/elitebank?createDatabaseIfNotExist=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:1234}

spring.mail.username=${SMTP_USERNAME:}
spring.mail.password=${SMTP_PASSWORD:}

jwt.secret=${JWT_SECRET:change-me-in-production}
```

### Step 2: Frontend — use environment config

**environment.ts:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api',
  encryptionKey: 'EnsarBank@SecureKey2024!@#$%^&*()_+' // development only
};
```

**environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  apiUrl: '/api', // relative path for production
  encryptionKey: '' // must be set via runtime config
};
```

**crypto.service.ts** — reference environment:
```typescript
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly secretKey = environment.encryptionKey;
  // ... rest unchanged
}
```

### Step 3: Update auth.service.ts and api.service.ts to use environment

```typescript
import { environment } from '../../../environments/environment';

// In AuthService:
private readonly API_URL = `${environment.apiUrl}/auth`;

// In ApiService:
private readonly BASE = environment.apiUrl;
```

## Verification

1. Set env vars: `export DB_USERNAME=root DB_PASSWORD=mypassword`
2. Start backend: `mvn spring-boot:run`
3. Verify app connects to DB with env var credentials
4. Build frontend: `ng build`
5. Verify no hardcoded URLs in compiled JS (search for `localhost:8085`)

## Maintenance Note

- For production deployment, set `DB_PASSWORD`, `SMTP_PASSWORD`, `JWT_SECRET` as environment variables
- The AES encryption key in `environment.ts` is dev-only; production must use a runtime-injected value
- Consider using Spring Cloud Config or Vault for secrets management in production
