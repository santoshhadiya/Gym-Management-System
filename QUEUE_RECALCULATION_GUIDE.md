# Queue Recalculation After Upgrade - Technical Documentation

## Overview

When a member upgrades their active plan, all queued plans are **automatically recalculated and shifted forward** to align with the new active plan's expiry date. This ensures data consistency and prevents gaps or overlaps in the plan schedule.

---

## Scenario Walkthrough

### Initial Setup
```
Jan 01, 2026 - Member purchases 30-day plan
Start: 01 Jan 2026
Expiry: 31 Jan 2026 (30 days later)
```

### Member Queues Plans
```
Member queues Plan B (30 days):
Scheduled Start: 31 Jan 2026 (after Plan A expires)
Scheduled Expiry: 02 Mar 2026

Member queues Plan C (30 days):
Scheduled Start: 02 Mar 2026 (after Plan B expires)
Scheduled Expiry: 01 Apr 2026
```

### Member Upgrades Active Plan
```
BEFORE UPGRADE:
Active Plan A: 30 days (31 Jan 2026 expiry)
Queued B: Starts 31 Jan, Expires 02 Mar
Queued C: Starts 02 Mar, Expires 01 Apr

UPGRADE EVENT: Member upgrades Plan A to 90 days
New Expiry: 31 Mar 2026 (instead of 31 Jan)

⚠️ PROBLEM: Queued plans have start dates in the past/overlap!
```

### Automatic Recalculation (NEW)
```
AFTER RECALCULATION:
Active Plan A: 90 days (31 Mar 2026 expiry) ✅
Queued B: Starts 31 Mar, Expires 30 Apr (shifted forward!) ✅
Queued C: Starts 30 Apr, Expires 30 May (shifted forward!) ✅

All plans automatically shifted without gaps or overlaps!
```

---

## Technical Implementation

### 1. New Service Function: `recalculateQueuedPlansAfterUpgrade()`

**Location:** `BackEnd/services/planService.js`

**Purpose:** Recalculates all pending queued plans when the active plan's expiry date changes

**Function Signature:**
```javascript
recalculateQueuedPlansAfterUpgrade(memberId, newActiveExpiryDate)
  → Returns: { updatedCount: number, queuedPlans: array }
```

**Algorithm:**
1. Query all pending queue items sorted by `queuePosition`
2. Start with `currentBaseDate` = new active plan's expiry date
3. For each queued plan:
   - `scheduledStartDate` = `currentBaseDate`
   - `scheduledExpiryDate` = `scheduledStartDate` + plan duration (in days)
   - Update `currentBaseDate` = `scheduledExpiryDate` (for next plan)
4. Save all updated queue items
5. Return count and updated plans

**Key Logic:**
```javascript
// First queued plan starts when active plan expires
const scheduledStartDate = newActiveExpiryDate;

// Each subsequent plan starts when previous plan expires
for each queuedPlan:
  scheduledExpiryDate = scheduledStartDate + queuedPlan.duration
  nextPlan.scheduledStartDate = scheduledExpiryDate
```

### 2. Updated Payment Controller: `handleUpgradePayment()`

**Location:** `BackEnd/controllers/paymentController.js`

**Changes:**
- After upgrading member's plan and saving to database
- Calls `planService.recalculateQueuedPlansAfterUpgrade()`
- Passes new expiry date of upgraded plan
- Error handling: Logs warning if recalculation fails, doesn't fail upgrade

**Code Flow:**
```javascript
// 1. Update active plan in database
member.expiryDate = upgradeCalc.newExpiryDate;
await member.save();

// 2. Automatically recalculate queued plans
await planService.recalculateQueuedPlansAfterUpgrade(
  member._id,
  upgradeCalc.newExpiryDate
);

// 3. Return success response
return { message: "Plan upgraded successfully", ... };
```

---

## Data Model

### PlanQueue Document Before/After
```javascript
// BEFORE UPGRADE
{
  _id: ObjectId("..."),
  member: ObjectId("..."),
  plan: ObjectId("plan-B"),
  queuePosition: 1,
  status: "Pending",
  scheduledStartDate: 2026-01-31T00:00:00Z,    // ❌ In past after upgrade
  scheduledExpiryDate: 2026-03-02T00:00:00Z,    // ❌ Overlaps active plan
}

// AFTER RECALCULATION
{
  _id: ObjectId("..."),
  member: ObjectId("..."),
  plan: ObjectId("plan-B"),
  queuePosition: 1,
  status: "Pending",
  scheduledStartDate: 2026-03-31T00:00:00Z,    // ✅ Updated
  scheduledExpiryDate: 2026-04-30T00:00:00Z,    // ✅ Updated
}
```

---

## Automatic Recalculation Triggers

### ✅ Currently Triggers Recalculation:
1. **Upgrade Payment Verification** - When member successfully upgrades plan

### ⏳ Future Triggers (Can Be Implemented):
2. Plan extension without changing plan type
3. Manual plan modifications by admin
4. Plan duration updates
5. Mid-plan adjustments

---

## Frontend Behavior

### User Experiences

**Scenario 1: View Membership After Upgrade**
```
GET /upgrades/membership-details
Response includes:
{
  queuedPlans: [
    {
      plan: { name: "Plan B", duration: 30 },
      scheduledStartDate: "31-03-2026",      // Updated
      scheduledExpiryDate: "30-04-2026",     // Updated
      queuePosition: 1
    },
    {
      plan: { name: "Plan C", duration: 30 },
      scheduledStartDate: "30-04-2026",      // Updated
      scheduledExpiryDate: "30-05-2026",     // Updated
      queuePosition: 2
    }
  ]
}
```

**User Sees:**
- Old queued dates are replaced with new dates
- No notification popup (transparent update)
- Membership page shows accurate upcoming plans

**Scenario 2: Queue Already Contains Plans**
- Member doesn't need to do anything
- Recalculation happens automatically
- No data loss or plan cancellation
- Plan order remains unchanged

---

## Edge Cases Handled

### 1. No Queued Plans
```javascript
queuedPlans.length === 0
// Returns { updatedCount: 0, queuedPlans: [] }
// No changes needed
```

### 2. Single Queued Plan
```javascript
Before: Plan A (30 days), expires Jan 31
        Plan B queued to start Jan 31

After upgrade: Plan A (90 days), expires Mar 31
               Plan B recalculated to start Mar 31 ✅
```

### 3. Multiple Queued Plans
```javascript
Before: A (exp: Jan 31) → B (start: Jan 31, exp: Feb 28) → C (start: Feb 28, exp: Mar 30)

After:  A (exp: Mar 31) → B (start: Mar 31, exp: Apr 30) → C (start: Apr 30, exp: May 30) ✅
        All plans shifted, all dates recalculated
```

### 4. Very Large Queue (10+ plans)
```javascript
// Works efficiently:
// - Queries PlanQueue once with sort
// - Updates all in parallel with Promise.all()
// - No N+1 query problem
// - Database indexes ensure fast queries
```

---

## Error Handling

### Graceful Degradation
```javascript
try {
  await planService.recalculateQueuedPlansAfterUpgrade(...);
} catch (error) {
  console.error("Warning: Failed to recalculate...", error);
  // ✅ Upgrade completes successfully
  // ⚠️ Queue recalculation failed logged as warning
  // Next attempt: When member logs in, updates from DB
}
```

### Why Graceful?
- Queue recalculation is secondary operation
- Primary goal is to complete the payment and upgrade
- If calculation fails, database will have current dates (worst case)
- Member can manually request recalculation if needed

---

## Database Performance

### Indexes Required
```javascript
// Ensure these indexes exist:
db.planqueues.createIndex({ member: 1, status: 1, queuePosition: 1 });

// Operations:
// 1. Query: O(1) with index - locates queued plans instantly
// 2. Update: O(n) where n = queued plan count (typically 1-10)
// 3. Save: Parallel with Promise.all() - fast
```

### Query Optimization
```javascript
// Single query gets all pending plans sorted
const queuedPlans = await PlanQueue.find({
  member: memberId,
  status: "Pending"
})
  .sort({ queuePosition: 1 })
  .populate("plan");  // Load plan duration

// Parallel updates
const updatePromises = queuedPlans.map(queueItem => {
  // Modify queueItem
  return queueItem.save();
});
await Promise.all(updatePromises);
```

---

## Response Logging

### Console Output
```bash
# When recalculation completes:
✅ Recalculated 3 queued plans for member 507f1f77bcf86cd799439011

# If error occurs:
Error recalculating queued plans: [Error details]
```

### Monitoring
Can be integrated with logging service:
```javascript
logger.info("Queue recalculation", {
  memberId: member._id,
  updatedCount: 3,
  newExpiryDate: upgradeCalc.newExpiryDate,
  duration: "45ms"
});
```

---

## Testing Scenarios

### Test Case 1: Single Queue Item
```
✓ Upgrade active plan
✓ Queued plan start date shifts to new expiry
✓ Queued plan expiry date recalculated
✓ Queue position remains 1
```

### Test Case 2: Multiple Queue Items
```
✓ All queue items recalculated
✓ Queue positions unchanged (1, 2, 3...)
✓ Dates properly chained (B.start = A.expiry, C.start = B.expiry)
✓ No gaps in schedule
```

### Test Case 3: No Queue Items
```
✓ Upgrade completes
✓ No errors from queue recalculation
✓ System handles gracefully
```

### Test Case 4: Upgrade to Shorter Plan (Queue Only)
```
✓ Upgrade blocked (can't upgrade to shorter)
✓ User prompted to queue instead
✓ Queue recalculation NOT triggered (no upgrade happens)
```

### Test Case 5: Concurrent Requests
```
✓ Member initiates upgrade
✓ Before upgrade completes, member views membership
✓ Sees old dates (race condition acceptable)
✓ Refreshes page after upgrade completes
✓ Sees new recalculated dates
```

---

## Future Enhancements

### 1. Real-Time Updates
```javascript
// Use WebSocket to notify member of queue changes
socket.emit("queue.recalculated", updatedPlans);
// Frontend: Show toast notification "Your queued plans have been updated!"
```

### 2. Audit Trail
```javascript
// Log each recalculation for transparency
db.auditLog.insertOne({
  action: "queue_recalculated",
  member: memberId,
  trigger: "upgrade",
  oldDates: [...],
  newDates: [...],
  timestamp: new Date()
});
```

### 3. Manual Recalculation Endpoint
```javascript
// Allow admin/member to manually trigger
POST /upgrades/recalculate-queue
// Useful if data gets out of sync
```

### 4. Predictive Notifications
```javascript
// Notify member 7 days before queued plan starts
// "Your queued plan 'Premium' will start in 7 days!"
```

---

## Troubleshooting

### Issue: Queue dates not updating after upgrade

**Check:**
1. ✓ Is member.expiryDate being set correctly? `console.log(member.expiryDate)`
2. ✓ Are there pending queue items? `db.planqueues.find({ member: X, status: "Pending" }).count()`
3. ✓ Is recalculation function being called? Check console logs
4. ✓ Can you manually verify updated dates? Query PlanQueue collection

**Solution:**
- If queue items exist but dates unchanged, ensure index: `db.planqueues.createIndex({ member: 1, status: 1, queuePosition: 1 })`
- If function not called, check payment handler has updated code
- If error in recalculation, check Plan object has `duration` field

### Issue: Queued plans appear with past dates

**Possible Causes:**
1. Upgrade happened but recalculation failed silently
2. Member viewing stale cached data
3. New member created with queues from another member (data corruption)

**Fix:**
```javascript
// Manual recalculation for debugging:
const PlanQueue = require("./models/PlanQueue");
const planService = require("./services/planService");
const member = await Member.findById(memberId).populate("plan");

await planService.recalculateQueuedPlansAfterUpgrade(
  memberId,
  member.expiryDate
);
```

---

## Summary

**What This Solves:**
- ✅ No more overlapping plans after upgrade
- ✅ No gap periods between queued plans
- ✅ Automatic adjustments (no manual intervention)
- ✅ Data consistency maintained
- ✅ Transparent to user (happens in background)

**When It Happens:**
- Automatically triggers after successful upgrade payment verification

**Performance Impact:**
- Minimal: O(n) where n = queue length (typically < 10)
- Database query + parallel updates = fast operation

**Error Handling:**
- Graceful degradation: Upgrade succeeds even if recalculation fails
- Non-blocking: Doesn't delay payment response

**User Experience:**
- Seamless: User doesn't see complexity
- Accurate: Always shows correct upcoming plan dates
- Reliable: Automatic adjustments prevent confusion

---

End of Queue Recalculation Guide
