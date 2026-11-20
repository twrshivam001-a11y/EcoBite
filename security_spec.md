# EcoBite Firestore Security Specification

## 1. Data Invariants
1. **User PII Isolation**: User profiles (`/users/{userId}`) contain phone numbers, emails, and hostel addresses. Only the owning user (`request.auth.uid == userId`) or a verified EcoBite admin (`twrshivam001@gmail.com`) may read or update them.
2. **Identity Ownership**: Every `Order`, `Subscription`, and `Feedback` document must bind `userId == request.auth.uid` on creation and keep `userId` immutable on update.
3. **Order Integrity**: Orders must start with `status == 'confirmed'`, `hasFeedback == false`, bounded `items` (1–10 items), positive pricing, and server timestamps (`createdAt == request.time`, `updatedAt == request.time`). Terminal states (`delivered`, `cancelled`) cannot transition back to active states.
4. **Subscription Integrity**: Subscriptions must start with `remainingMeals == totalMeals` and valid plan totals (`5`, `15`, or `30`). Users cannot artificially inflate `remainingMeals`.
5. **Feedback Relational Consistency**: Feedback must carry ratings strictly between `1` and `5` and reference either `'general_pilot'` or an existing order in `/orders/{orderId}` owned by the submitting user.

## 2. Dirty Dozen Attack Payloads (All Must Fail with PERMISSION_DENIED)
1. Unauthenticated read on `/users/user_1`.
2. Reading another user's profile (`/users/victim_uid` as `attacker_uid`).
3. Unverified email user creating an order (`email_verified: false`).
4. Identity spoofing on order creation (`userId: "victim_uid"` while signed in as `attacker_uid`).
5. Shadow field injection on user profile (`isAdmin: true` or `role: "admin"`).
6. Resource poisoning with oversized `addressLine` (> 250 chars) or oversized `orderId` (> 128 chars).
7. Skipping order state on create (`status: "delivered"` instead of `"confirmed"`).
8. Tampering with `totalAmount` / `createdAt` during an order update.
9. Reopening a terminal `delivered` order back to `confirmed`.
10. Subscription meal inflation (`remainingMeals: 999` on update).
11. Cross-user list query without `userId == request.auth.uid` filter on `/orders`.
12. Submitting feedback with out-of-range rating (`tasteRating: 10`) or referencing another user's `orderId`.
