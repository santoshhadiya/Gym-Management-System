# Database Migration Guide - Plan Upgrade System

## Overview

This guide explains the database changes needed to support the new plan upgrade and queueing system.

## What Changed

### New Collection: `planqueues`
Stores queued and upgraded plans for members.

### Modified Collection: `members`
Added two new fields to track plan queue and history.

---

## Step 1: Create Indexes

### For PlanQueue Collection

Run these commands in your MongoDB client:

```javascript
// Connect to your database
use gym_management

// Index 1: Find queued plans by member and status
db.planqueues.createIndex({
  member: 1,
  status: 1
})

// Index 2: Find plans to activate (by scheduled date)
db.planqueues.createIndex({
  scheduledStartDate: 1,
  status: 1
})

// Index 3: Find active plans by member
db.planqueues.createIndex({
  member: 1,
  status: 1,
  queuePosition: 1
})

// Index 4: Unique constraint - only one active upgrade per member per plan
db.planqueues.createIndex({
  member: 1,
  purchaseType: 1
},
{
  sparse: true
})
```

### For Members Collection

```javascript
// Index for plan queue lookup
db.members.createIndex({
  planQueue: 1
})

// Index for plan history searches
db.members.createIndex({
  "planHistory.createdAt": 1
})
```

### For Payment Collection (Optional but recommended)

```javascript
// Better query performance for upgrade payments
db.payments.createIndex({
  member: 1,
  createdAt: -1
})
```

---

## Step 2: Update Existing Members

Migrate existing members to have empty queue and history:

```javascript
// Initialize planQueue and planHistory for all members
db.members.updateMany(
  {},
  {
    $set: {
      planQueue: [],
      planHistory: []
    }
  },
  { multi: true }
)

// Result: All members now have empty queue and history
```

## Step 3: Backfill Plan History (Optional but Recommended)

Populate plan history from existing payment records:

```javascript
// For each member, add their existing plan as history
db.members.find().forEach(function(member) {
  if (member.plan) {
    // Find latest payment for this member
    const payment = db.payments.findOne(
      { member: member._id },
      { sort: { paidAt: -1 } }
    );
    
    if (payment) {
      db.members.updateOne(
        { _id: member._id },
        {
          $push: {
            planHistory: {
              plan: member.plan,
              startDate: member.startDate || new Date(),
              expiryDate: member.expiryDate,
              purchaseType: "new",
              amount: payment.amount,
              payment: payment._id,
              createdAt: payment.paidAt
            }
          }
        }
      );
    }
  }
});
```

---

## Step 4: Verify Changes

### Check Member Schema

```javascript
// Should now include planQueue and planHistory
db.members.findOne()

// Expected output:
{
  _id: ObjectId(...),
  user: ObjectId(...),
  plan: ObjectId(...),
  startDate: ISODate(...),
  expiryDate: ISODate(...),
  status: "Active",
  planQueue: [],           // NEW
  planHistory: [           // NEW
    {
      plan: ObjectId(...),
      startDate: ISODate(...),
      expiryDate: ISODate(...),
      purchaseType: "new",
      amount: 999,
      payment: ObjectId(...),
      createdAt: ISODate(...)
    }
  ],
  // ... other fields
}
```

### Check PlanQueue Collection Exists

```javascript
// Should appear in collection list
show collections

// Should show planqueues (or planqueues if pluralized)
```

### Verify Indexes

```javascript
// List all indexes on planqueues
db.planqueues.getIndexes()

// List all indexes on members
db.members.getIndexes()
```

---

## Step 5: Test the Setup

### Test 1: Insert a Test Member with Queue

```javascript
// Create a test member
db.members.insertOne({
  user: ObjectId(),
  plan: ObjectId("507f1f77bcf86cd799439011"),
  startDate: new Date(),
  expiryDate: new Date(Date.now() + 30*24*60*60*1000),
  status: "Active",
  planQueue: [],
  planHistory: []
})

// Create a test queued plan
const memberId = db.members.findOne()._id;
db.planqueues.insertOne({
  member: memberId,
  plan: ObjectId("507f1f77bcf86cd799439012"),
  scheduledStartDate: new Date(Date.now() + 30*24*60*60*1000),
  scheduledExpiryDate: new Date(Date.now() + 90*24*60*60*1000),
  payment: ObjectId(),
  purchaseType: "queue",
  status: "Pending",
  queuePosition: 1,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Update member's planQueue
db.members.updateOne(
  { _id: memberId },
  { $push: { planQueue: db.planqueues.findOne()._id } }
)
```

### Test 2: Query Performance

```javascript
// Should use index and be fast
db.planqueues.find({
  member: ObjectId("507f1f77bcf86cd799439011"),
  status: "Pending"
}).explain("executionStats")

// Should show "executionStages.stage": "IXSCAN" (index scan, not COLLSCAN)
```

---

## Rollback Plan

If something goes wrong:

### Remove New Fields from Members

```javascript
db.members.updateMany(
  {},
  {
    $unset: {
      planQueue: 1,
      planHistory: 1
    }
  }
)
```

### Drop PlanQueue Collection

```javascript
db.planqueues.drop()
```

### Restore Original State

Since we're only adding fields, the original `member` schema remains valid. Just remove the new fields and the system reverts.

---

## MongoDB Atlas (Cloud) Migration

If using MongoDB Atlas:

1. **Via UI:**
   - Go to Collections tab
   - Add new collection `planqueues` manually (optional)
   - Go to Indexes tab
   - Add indexes through UI

2. **Via Atlas Data Tools:**
   - Use MongoDB Compass
   - Run index creation scripts
   - Monitor in Atlas dashboard

3. **Script-based:**
   ```bash
   # Via mongosh
   mongosh "mongodb+srv://username:password@host" \
     --file migration.js
   ```

---

## Migration Validation Checklist

- [ ] All indexes created successfully
- [ ] Members collection has new fields
- [ ] PlanQueue collection exists
- [ ] Sample data inserted correctly
- [ ] Query performance verified (IXSCAN)
- [ ] Existing members can still log in
- [ ] Payment history still intact
- [ ] No migration errors in logs

---

## Performance Metrics After Migration

Expected improvements:
- Plan queue lookups: < 10ms (with index)
- Member upgrades: < 50ms (with index)
- Plan history retrieval: < 100ms (with pagination)

Monitor with:
```javascript
db.serverStatus().opLatencies
```

---

## Memory Considerations

### Storage Added per Member

```
planQueue: [] = ~50 bytes (empty)
planHistory entry = ~300 bytes (per entry)
Index overhead = ~5KB per collection
```

For 10,000 members:
- Base storage: ~500KB
- With 100 plan history entries average: ~300MB
- Total: ~300MB (minimal impact)

---

## Backup Recommendations

Before migration:

```bash
# MongoDB local backup
mongodump --out /backup/gym_db_pre_upgrade

# MongoDB Atlas backup
# Enable automatic backups in UI (usually enabled by default)
```

---

## Troubleshooting

### Issue: "Duplicate key error" when creating index

**Cause:** Existing index with same name
**Solution:**
```javascript
db.planqueues.dropIndex("index_name")
db.planqueues.createIndex({...})
```

### Issue: Member queries suddenly slow

**Cause:** COLLSCAN instead of IXSCAN
**Solution:**
```javascript
// Check index status
db.members.getIndexes()

// Rebuild indexes if needed
db.members.reIndex()
```

### Issue: planQueue field not found

**Cause:** Migration didn't run for all members
**Solution:**
```javascript
// Run update again
db.members.updateMany(
  { planQueue: { $exists: false } },
  { $set: { planQueue: [] } }
)
```

---

## Timeline for Safe Migration

**Recommended approach:**

1. **Day 1:** Run indexes on development database
2. **Day 2:** Test with sample data
3. **Day 3:** Run migration on staging database
4. **Day 4:** Full testing on staging
5. **Day 5:** Deploy to production during low-traffic time
6. **Day 6:** Monitor for 24 hours

---

## Post-Migration Monitoring

### Queries to Run Regularly

```javascript
// Monthly: Check index efficiency
db.planqueues.aggregate([
  { $indexStats: {} }
])

// Weekly: Check queue count
db.planqueues.countDocuments({ status: "Pending" })

// Daily: Check for slow operations
db.currentOp()
```

### Expected Numbers

- Active members with plans: ~90% of total
- Members with queued plans: ~5-10% of active
- Average upgrade discount: 20-30%

---

## Documentation Links

- [MongoDB Index Docs](https://docs.mongodb.com/manual/indexes/)
- [MongoDB Atlas Administration](https://docs.mongodb.com/atlas/atlas-menu/)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)

---

## Questions Before Migration?

**Verify these before proceeding:**

1. ✅ Do I have database backups?
2. ✅ Is this during low-traffic time?
3. ✅ Do I have MongoDB client access?
4. ✅ Are indexes creating without errors?
5. ✅ Have I tested on development first?

If all yes, you're ready to migrate! 🚀

---

**Migration Date:** [Your Date]
**Status:** Ready for Production
**Rollback Time:** < 5 minutes
