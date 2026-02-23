# Technical Validation Guide - Plan Queue & Upgrade System

## Quick Start - Testing the Implementation

### Prerequisites
- Node.js backend running on `http://localhost:8000`
- React frontend running on `http://localhost:5173`
- MongoDB with collections: Members, Plans, PlanQueue, Payments
- Razorpay keys configured in `.env`

---

## Test Case 1: Members Without Active Plan (Case A)

### Setup
1. Use a member account with no active plan or expired plan
2. Navigate to Plans page
3. Select any plan (e.g., "30-Day Plan" ₹3000)

### Expected Behavior
✅ Payment page shows:
- "Start Your Fitness Journey" section only
- "Start Now - ₹3000" button
- NO upgrade or queue options
- Simple direct purchase flow

### Verification
```bash
# Check member profile API
GET /members/profile
# Expected: expiryDate < today OR no expiryDate

# Check upgrade endpoints
POST /upgrades/calculate
Response should have:
{
  "type": "no_active_plan",
  "canUpgrade": false,
  "canQueue": false,
  "canDirectPurchase": true
}
```

---

## Test Case 2: Members With Active Plan - Upgrade Available

### Setup
1. Use member with active plan: 30-day plan, 15 days remaining
2. Current plan: ₹3000
3. Select longer plan: 90-day plan, ₹7500

### Expected Behavior
✅ Payment page shows:
- Current plan expiry: "15 days remaining"
- "Upgrade Your Plan" card (HIGHLIGHTED if selected)
  - Shows: "Save ₹..." discount
  - Amount to charge: ₹5250 (90-day price ₹7500 - remaining value ₹2250)
- "Queue This Plan" card (available)
- UpgradeBreakdown component visible when Upgrade is selected
- "Proceed with Upgrade" button shows discounted amount

### Verification
```bash
POST /upgrades/calculate
Body: { "newPlanId": "90-day-plan-id" }
Response should have:
{
  "type": "active_plan_options",
  "canUpgrade": true,
  "canQueue": true,
  "calculation": {
    "amountToCharge": 5250,
    "discountApplied": 2250,
    "percentageSaved": 30,
    "newExpiryDate": "..." + 90 days
  }
}
```

---

## Test Case 3: Members With Active Plan - Downgrade Via Queue

### Setup
1. Member with active plan: 90-day plan, 60 days remaining
2. Current plan: ₹7500
3. Select shorter plan: 30-day plan, ₹3000

### Expected Behavior
✅ Payment page shows:
- Current plan expiry: "60 days remaining"
- NO "Upgrade Your Plan" card (downgrade not allowed)
- "Queue This Plan" card (ALWAYS available for any duration)
  - Shows: "Scheduled to start in 60 days"
  - Amount to charge: ₹3000 (full price)
- "Proceed to Payment" shows ₹3000

### Verification
```bash
POST /upgrades/calculate
Body: { "newPlanId": "30-day-plan-id" }
Response should have:
{
  "type": "queue_only",
  "canUpgrade": false,
  "canQueue": true,
  "amountToCharge": 3000
}

# Verify queue is created
GET /upgrades/membership-details
Response includes:
{
  "queuedPlans": [
    {
      "plan": { "name": "30-Day Plan", "duration": 30 },
      "scheduledStartDate": current_expiry + 60 days,
      "scheduledExpiryDate": current_expiry + 90 days,
      "queuePosition": 1
    }
  ]
}
```

---

## Test Case 4: Multiple Queue Chaining (Advanced)

### Setup
1. Member with active plan: 30-day, expires on Day 30
2. Queue Plan B (60-day)
3. Queue Plan C (30-day)

### Step 1: Create First Queue Item
```bash
POST /payments/razorpay-order
Body: {
  "planId": "plan-b-id",
  "purchaseType": "queue",
  "amountToCharge": 6000
}

POST /payments/verify
Body: {...payment verification}

# Verify queue position
GET /upgrades/membership-details
Response:
{
  "queuedPlans": [
    {
      "plan": { "name": "Plan B", "duration": 60 },
      "scheduledStartDate": "Day 30",
      "scheduledExpiryDate": "Day 90",
      "queuePosition": 1
    }
  ]
}
```

### Step 2: Queue Second Plan
```bash
POST /upgrades/calculate
Body: { "newPlanId": "plan-c-id" }
Response:
{
  "canQueue": true,
  "amountToCharge": 3000
}

# This should recognize Plan B in queue and chain from it!

POST /payments/verify
Body: {...payment verification for Plan C}

# Verify chaining
GET /upgrades/membership-details
Response:
{
  "queuedPlans": [
    {
      "plan": { "name": "Plan B", "duration": 60 },
      "scheduledStartDate": "Day 30",
      "scheduledExpiryDate": "Day 90",
      "queuePosition": 1
    },
    {
      "plan": { "name": "Plan C", "duration": 30 },
      "scheduledStartDate": "Day 90",        // ← Starts after B expires!
      "scheduledExpiryDate": "Day 120",      // ← Properly chained!
      "queuePosition": 2
    }
  ]
}
```

### Expected Results
✅ Plan B starts on Day 30 (after current 30-day plan)
✅ Plan C starts on Day 90 (after Plan B expires)
✅ Plan C expiry: Day 120 (90 + 30 days)
✅ Each plan's start = previous plan's expiry

---

## Test Case 5: Same Duration - Queue vs Upgrade

### Setup
1. Member with active plan: 30-day, 20 days remaining
2. Select another 30-day plan

### Expected Behavior
✅ Payment page shows:
- NO "Upgrade Your Plan" card (same duration not allowed for upgrade)
- "Queue This Plan" card
  - Shows: "Scheduled to start in 20 days"
  - Amount: ₹3000

### Verification
```bash
POST /upgrades/calculate
Body: { "newPlanId": "same-30-day-plan-id" }
Response:
{
  "type": "queue_only",
  "canUpgrade": false,
  "canQueue": true,
  "amountToCharge": 3000
}
```

---

## API Response Formats

### 1. POST /upgrades/calculate

**Case A: No Active Plan**
```json
{
  "type": "no_active_plan",
  "canUpgrade": false,
  "canQueue": false,
  "canDirectPurchase": true,
  "message": "No active plan. You can purchase this plan directly.",
  "planDetails": { "name": "30-Day", "duration": 30, "price": 3000 },
  "amountToCharge": 3000
}
```

**Case B: Upgrade Available**
```json
{
  "type": "active_plan_options",
  "canUpgrade": true,
  "canQueue": true,
  "currentPlan": { "name": "30-Day", "duration": 30 },
  "newPlan": { "name": "90-Day", "duration": 90, "price": 7500 },
  "calculation": {
    "amountToCharge": 5250,
    "discountApplied": 2250,
    "percentageSaved": 30,
    "newExpiryDate": "2024-03-15",
    "remainingValue": 2250,
    "newPlanValue": 7500
  },
  "message": "Choose to upgrade now or queue for later."
}
```

**Case C: Queue Only (Downgrade)**
```json
{
  "type": "queue_only",
  "canUpgrade": false,
  "canQueue": true,
  "message": "You can queue this plan for later.",
  "planDetails": { "name": "30-Day", "duration": 30, "price": 3000 },
  "amountToCharge": 3000
}
```

---

## Common Issues & Debugging

### Issue 1: Queue Not Chaining Properly

**Symptom:** Second queue item has wrong start date

**Debug Steps:**
```bash
# Check PlanQueue collection
db.planqueues.find({ member: ObjectId("...") })

# Verify:
# 1. queuePosition is sequential (1, 2, 3...)
# 2. scheduledExpiryDate increases properly
# 3. Status is "Pending"

# Check service function
# In calculateQueuedPlanDates():
# - Should query PlanQueue with member ID and status="Pending"
# - Should sort by queuePosition
# - Should use last item's scheduledExpiryDate as new item's start
```

**Solution:**
- Ensure PlanQueue documents have correct `queuePosition`
- Verify `scheduledExpiryDate` calculation: `startDate + duration * 24 hours`
- Check member._id matches in query

### Issue 2: Upgrade Available But UI Shows Queue Only

**Symptom:** `canUpgrade` is false when it should be true

**Debug Steps:**
```bash
# Check determineUpgradeType() logic
# In planService.js:
# canUpgrade = isUpgradeAllowed(currentDuration, newDuration)
# isUpgradeAllowed = (newDuration > currentDuration)

# Example:
# Current: 30 days, New: 90 days
# Should return true (90 > 30)

# Verify:
console.log("Current:", member.plan.duration);  // Should be <= new
console.log("New:", newPlan.duration);           // Should be > current
```

**Solution:**
- Ensure plan durations are set correctly in database
- Check `isUpgradeAllowed()` function returns correct boolean
- Verify service is being called with correct plan objects

### Issue 3: Payment Page Shows Nothing (Case A & B Both Missing)

**Symptom:** Payment page blank or no options visible

**Debug Steps:**
```bash
# Check member profile API
GET /members/profile
# Verify: expiryDate exists and is valid

# Check if determineOptions() is being called
# In Payment.jsx browser console:
console.log("Member data:", memberData);
console.log("Can upgrade:", canUpgrade);
console.log("Can queue:", canQueue);
console.log("Can direct:", canDirectPurchase);
```

**Solution:**
- Verify member profile API returns expiryDate
- Check Date comparison: `new Date(expiryDate) > today`
- Ensure `/upgrades/calculate` endpoint is callable
- Check API error responses in browser Network tab

### Issue 4: Upgrade Discount Wrong or Missing

**Symptom:** `amountToCharge` doesn't match expected savings

**Debug Steps:**
```bash
// In calculateUpgradeCost():
remainingDays = 15;
totalDays = 30;
planPrice = 3000;
percentRemaining = (15/30) * 100 = 50%
remainingValue = (3000 * 50) / 100 = 1500

newPlanPrice = 7500;
discountApplied = 1500;
amountToCharge = 7500 - 1500 = 6000;
percentageSaved = (1500 / 7500) * 100 = 20%;
```

**Verify:**
- `percentRemaining` calculation correct
- `remainingValue` math correct
- `amountToCharge` = newPrice - remainingValue

---

## Performance Optimization

### Database Indexes
```javascript
// Recommended indexes for planService functions:

// PlanQueue collection
db.planqueues.createIndex({ member: 1, status: 1, queuePosition: 1 });
db.planqueues.createIndex({ scheduledExpiryDate: 1 });

// Member collection
db.members.createIndex({ user: 1 });
db.members.createIndex({ expiryDate: 1 });

// Payments collection
db.payments.createIndex({ member: 1, status: 1 });
```

### Query Optimization
- `calculateQueuedPlanDates()` queries max 10-20 queue items (acceptable)
- `determineUpgradeType()` is O(1) comparison logic
- Payment verification uses signature (no database lookup)

---

## Rollout Checklist

- [ ] Backend servers deployed with updated services/controllers
- [ ] Frontend deployed with updated Payment.jsx
- [ ] Database indexes created
- [ ] Razorpay test credentials verified
- [ ] Test Case 1 (No Active Plan) passed
- [ ] Test Case 2 (Upgrade Available) passed
- [ ] Test Case 3 (Downgrade via Queue) passed
- [ ] Test Case 4 (Multiple Queue Chaining) passed
- [ ] Test Case 5 (Same Duration Queue) passed
- [ ] Production Razorpay credentials configured
- [ ] Error handling tested (plan inactive, price changed, etc.)
- [ ] Payment success/failure flows tested
- [ ] Queue activation cron job verified
- [ ] Plan history tracking verified
- [ ] Mobile UI responsive verified

---

## Monitoring & Analytics

### Key Metrics to Track
1. **Payment Success Rate** - Track upgrade vs queue vs new payment completion
2. **Queue Activation Rate** - How many queued plans auto-activate on schedule
3. **Average Upgrade Savings** - Track discounts given to upgrading members
4. **Plan Duration Distribution** - See which plan durations are most queued

### Logging Recommendations
```javascript
// Add to planService functions:
console.log("Determining upgrade type", { currentDuration, newDuration, result });
console.log("Calculating queue dates", { queueLength, lastExpiry, newStartDate });
console.log("Payment processed", { purchaseType, amountCharged, member });
```

---

## Success Indicators

✅ All test cases pass
✅ Payment flows complete without errors
✅ Queue items properly chain dates
✅ Upgrade calculations show correct savings
✅ Payment.jsx displays appropriate options
✅ Razorpay payments verify successfully
✅ Plan history records all purchases
✅ No console errors in browser
✅ API responses match expected formats
✅ Database records created correctly

---

## Next Steps for Production

1. **Monitor first week** - Track payment success/failure rates
2. **Gather user feedback** - Payment page usability
3. **Queue activation** - Monitor cron job for auto-activation
4. **Scale testing** - Test with 1000+ concurrent queue items
5. **Integration testing** - Verify with other features (sessions, tracking, etc.)

---

End of Technical Validation Guide
