# Plan 011: Change ddl-auto from update to validate

**Commit:** `44740aa`
**Finding:** #14 (HIGH)
**Effort:** S | **Risk:** Low

## Problem

`application.properties:11` has `spring.jpa.hibernate.ddl-auto=update` which allows Hibernate to modify the production database schema. This can cause data loss (dropping columns) and is not idempotent.

## Scope

**Files to modify:**
- `src/main/resources/application.properties`

**Files NOT to modify:**
- Any Java or TypeScript files

## Required Changes

### Step 1: Change ddl-auto to validate

```properties
# Before:
spring.jpa.hibernate.ddl-auto=update

# After:
spring.jpa.hibernate.ddl-auto=validate
```

### Step 2: (Optional) Add profile-specific config

Create `application-dev.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```

Keep `application.properties` with `validate` as the default.

## Verification

1. Start backend: `mvn spring-boot:run`
2. If schema is up-to-date, app starts normally
3. If schema is out-of-date, app throws `SchemaValidationException` on startup (this is the desired behavior — catch schema drift early)

## Maintenance Note

- Use Flyway or Liquibase for schema migrations in production
- `validate` mode checks that the entity model matches the database schema without modifying it
- For development, `update` is acceptable but should be in a separate profile
- Before deploying to production, run `mvn clean install -Dspring.profiles.active=prod` to use `validate`
