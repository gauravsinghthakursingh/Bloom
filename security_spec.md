# Security Specification: GreenBloom

## 1. Data Invariants
- **Authentication**: Users must be authenticated and email-verified to perform any write operations (except initial user creation).
- **Identity**: Users can only modify resources they own (profiles, orders, wishlist).
- **Integrity**: 
  - `role` can only be set to `admin` by an existing admin.
  - `createdAt` is immutable after creation.
  - Products can only be modified by admins.
- **Relational Integrity**: Orders must belong to an existing user.
- **Resource Hardening**: All string/list fields must have size constraints. Document IDs must be path-safe.

## 2. The "Dirty Dozen" Payloads

### P1: Role Escalation (Identity)
**Target**: `users/{userId}`
**Payload**: `{ "role": "admin" }`
**Expected**: `PERMISSION_DENIED` (User trying to make themselves admin on creation/update).

### P2: Product Modification (Identity)
**Target**: `products/{productId}`
**Payload**: `{ "price": 0.01 }`
**Expected**: `PERMISSION_DENIED` (Regular user trying to edit product).

### P3: Order Injection (Identity)
**Target**: `orders/{orderId}`
**Payload**: `{ "userId": "another_user_id", "totalAmount": 0 }`
**Expected**: `PERMISSION_DENIED` (Creating an order for someone else).

### P4: Timestamp Spoofing (Integrity)
**Target**: `reviews/{reviewId}`
**Payload**: `{ "createdAt": 0 }`
**Expected**: `PERMISSION_DENIED` (Using a client-side timestamp instead of server time).

### P5: Large String Attack (Denial of Wallet)
**Target**: `reviews/{reviewId}`
**Payload**: `{ "comment": "A".repeat(100000) }`
**Expected**: `PERMISSION_DENIED` (Review comment exceeds size limit).

### P6: ID Poisoning (Resource Poisoning)
**Target**: `products/../secret/config`
**Payload**: `{ "data": "hacked" }`
**Expected**: `PERMISSION_DENIED` (Attempting to write to outside collection via ID manipulation).

### P7: Ghost Field Injection (Integrity)
**Target**: `users/{userId}`
**Payload**: `{ "email": "user@example.com", "uid": "uid", "role": "user", "extraField": "malicious" }`
**Expected**: `PERMISSION_DENIED` (Writing fields not in schema).

### P8: Wishlist Theft (Identity)
**Target**: `wishlist/{wishlistId}`
**Payload**: `{ "productId": "p1", "userId": "target_user_id" }`
**Expected**: `PERMISSION_DENIED` (Adding to another user's wishlist).

### P9: Status Skipping (State Shortcutting)
**Target**: `orders/{orderId}`
**Payload**: `{ "status": "delivered" }`
**Expected**: `PERMISSION_DENIED` (User trying to mark their own order as delivered).

### P10: Orphaned Review (Relational)
**Target**: `reviews/{reviewId}`
**Payload**: `{ "productId": "non_existent_product", ... }`
**Expected**: `PERMISSION_DENIED` (Reviewing a product that doesn't exist).

### P11: Anonymous Write (Auth)
**Target**: `orders/{orderId}`
**Auth**: `null`
**Payload**: `{ ... }`
**Expected**: `PERMISSION_DENIED` (Writing without auth).

### P12: Unverified Write (Auth)
**Target**: `users/{userId}`
**Auth**: `{ uid: "uid", email_verified: false }`
**Payload**: `{ ... }`
**Expected**: `PERMISSION_DENIED` (Writing while unverified).

## 3. Test Runner
We will use `@firebase/rules-unit-testing` or manual verification against the "Eight Pillars".
