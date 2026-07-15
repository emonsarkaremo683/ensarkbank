# Plan 005: Remove CVV from CardResponse (PCI-DSS Violation)

**Commit:** `44740aa`
**Finding:** #6 (HIGH)
**Effort:** S | **Risk:** Low

## Problem

`CardResponse.java:20` exposes `private String cvv;` in API responses. CVV must never be stored after authorization or displayed to users (PCI-DSS requirement).

## Scope

**Files to modify:**
- `src/main/java/com/elitetech_inc/ensarkbank/account_management/card/dto/response/CardResponse.java`
- `src/main/java/com/elitetech_inc/ensarkbank/account_management/card/dto/mapper/CardMapper.java`

**Files NOT to modify:**
- `Card.java` entity — keep CVV field for internal processing, but don't expose it

## Required Changes

### Step 1: Remove cvv from CardResponse.java

Delete line 20:
```java
private String cvv;
```

### Step 2: Remove cvv mapping from CardMapper.java

Find the line that maps CVV (approximately line 59):
```java
.cvv(card.getCvv())
```

Delete this line.

### Step 3: (Optional) Add @JsonIgnore to Card entity as defense-in-depth

In `Card.java`, add `@JsonIgnore` to the cvv field:
```java
@JsonIgnore
private String cvv;
```

## Verification

1. Start backend: `mvn spring-boot:run`
2. Create a card via API
3. GET the card — response should NOT contain `cvv` field
4. Verify card still works for transactions (CVV is still stored internally)

## Maintenance Note

- The CVV field remains in the Card entity for transaction processing
- The `@JsonIgnore` defense prevents accidental exposure even if the mapper is not updated
- Never add CVV to any response DTO again
