const Plan = require("../models/Plan");
const Member = require("../models/Member");

/**
 * Calculate remaining days and value for current active plan
 * @param {Date} startDate - Plan start date
 * @param {Date} expiryDate - Plan expiry date
 * @param {Number} planPrice - Original plan price
 * @returns {Object} - { remainingDays, totalDays, usedDays, percentRemaining, remainingValue }
 */
exports.calculateRemainingValue = (startDate, expiryDate, planPrice) => {
  if (!startDate || !expiryDate) {
    return {
      remainingDays: 0,
      totalDays: 0,
      usedDays: 0,
      percentRemaining: 0,
      remainingValue: 0,
    };
  }

  const today = new Date();
  const totalDuration = expiryDate.getTime() - startDate.getTime();
  const remainingDuration = expiryDate.getTime() - today.getTime();

  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, Math.ceil(remainingDuration / (1000 * 60 * 60 * 24)));
  const usedDays = totalDays - remainingDays;
  const percentRemaining = (remainingDays / totalDays) * 100;
  const remainingValue = Math.round((planPrice * percentRemaining) / 100);

  return {
    remainingDays,
    totalDays,
    usedDays,
    percentRemaining,
    remainingValue,
  };
};

/**
 * Check if upgrade is allowed
 * @param {Number} currentDuration - Current plan duration in days
 * @param {Number} newDuration - New plan duration in days
 * @returns {Boolean} - True if upgrade is allowed, false otherwise
 */
exports.isUpgradeAllowed = (currentDuration, newDuration) => {
  return newDuration > currentDuration;
};

/**
 * Calculate upgrade cost
 * @param {Object} memberData - Current member data
 * @param {Object} currentPlan - Current active plan
 * @param {Object} newPlan - New plan to upgrade to
 * @returns {Object} - Detailed upgrade calculation
 */
exports.calculateUpgradeCost = (memberData, currentPlan, newPlan) => {
  // Check if upgrade is allowed
  if (!this.isUpgradeAllowed(currentPlan.duration, newPlan.duration)) {
    return {
      allowed: false,
      reason: "Can only upgrade to plans with longer duration",
    };
  }

  // Calculate remaining value of current plan
  const remainingInfo = this.calculateRemainingValue(
    memberData.startDate,
    memberData.expiryDate,
    currentPlan.price
  );

  const {
    remainingDays,
    totalDays,
    usedDays,
    percentRemaining,
    remainingValue,
  } = remainingInfo;

  // New plan total duration
  const newPlanTotalDays = newPlan.duration;
  const newPlanPrice = newPlan.price;

  // Calculate discounted amount for additional days
  // Unused portion of current plan is credited
  const additionalDaysNeeded = newPlanTotalDays - totalDays;
  const pricePerDayNewPlan = newPlanPrice / newPlanTotalDays;
  const costOfAdditionalDays = additionalDaysNeeded * pricePerDayNewPlan;

  // Final amount to charge = new plan price - remaining value of current plan
  const amountToCharge = Math.max(0, newPlanPrice - remainingValue);

  // Discount given = remaining value of current plan
  const discountApplied = remainingValue;

  // New expiry date = current expiry date + additional days
  const newExpiryDate = new Date(
    memberData.expiryDate.getTime() + additionalDaysNeeded * 24 * 60 * 60 * 1000
  );

  return {
    allowed: true,
    currentPlan: {
      name: currentPlan.name,
      duration: currentPlan.duration,
      price: currentPlan.price,
      usedDays,
      remainingDays,
      totalDays,
    },
    upgrade: {
      name: newPlan.name,
      duration: newPlan.duration,
      price: newPlan.price,
      additionalDaysGained: additionalDaysNeeded,
    },
    calculation: {
      newPlanPrice,
      remainingValueOfCurrentPlan: remainingValue,
      costOfAdditionalDays: Math.round(costOfAdditionalDays),
      discountApplied: Math.round(discountApplied),
      amountToCharge: Math.round(amountToCharge),
      percentageSaved: Math.round((discountApplied / newPlanPrice) * 100),
    },
    newExpiryDate,
  };
};

/**
 * Get queued plans for a member
 * @param {String} memberId - Member ID
 * @returns {Array} - Array of queued plans with details
 */
exports.getQueuedPlans = async (memberId) => {
  try {
    const member = await Member.findById(memberId).populate({
      path: "planQueue",
      populate: [
        { path: "plan" },
        { path: "payment" },
        { path: "upgradeDetails.originalPlan" },
      ],
    });

    if (!member) {
      return [];
    }

    return member.planQueue || [];
  } catch (error) {
    console.error("Error fetching queued plans:", error);
    return [];
  }
};

/**
 * Calculate scheduled dates for a queued plan
 * Takes into account all previously queued plans to determine start/expiry dates
 * PROPERLY HANDLES MULTIPLE QUEUE ITEMS
 * 
 * @param {Object} memberData - Current member with expiryDate and planQueue
 * @param {Object} newPlan - The new plan being queued
 * @returns {Object} - { scheduledStartDate, scheduledExpiryDate, queuePosition }
 */
exports.calculateQueuedPlanDates = async (memberData, newPlan) => {
  try {
    const PlanQueue = require("../models/PlanQueue");

    // Get all pending queued plans for this member, sorted by queue position
    const queuedPlans = await PlanQueue.find({
      member: memberData._id,
      status: "Pending",
    })
      .sort({ queuePosition: 1 })
      .populate("plan");

    // Start date is based on current plan's expiry if no queued plans,
    // or last queued plan's expiry date
    let scheduledStartDate;

    if (queuedPlans.length === 0) {
      // No queued plans - start after current plan expires
      scheduledStartDate = new Date(memberData.expiryDate);
    } else {
      // Start after the last queued plan expires
      const lastQueuedPlan = queuedPlans[queuedPlans.length - 1];
      scheduledStartDate = new Date(lastQueuedPlan.scheduledExpiryDate);
    }

    // Calculate expiry date for new plan
    const scheduledExpiryDate = new Date(
      scheduledStartDate.getTime() + newPlan.duration * 24 * 60 * 60 * 1000
    );

    // Queue position is the next position
    const queuePosition = queuedPlans.length + 1;

    return {
      scheduledStartDate,
      scheduledExpiryDate,
      queuePosition,
    };
  } catch (error) {
    console.error("Error calculating queued plan dates:", error);
    throw error;
  }
};

/**
 * Recalculate all queued plans when active plan expiry date changes (e.g., after upgrade)
 * This ensures queued plans automatically shift forward without gaps or overlaps
 * @param {String} memberId - Member ID
 * @param {Date} newActiveExpiryDate - New expiry date of the active plan
 * @returns {Object} - { updatedCount: number, queuedPlans: array }
 */
exports.recalculateQueuedPlansAfterUpgrade = async (memberId, newActiveExpiryDate) => {
  try {
    const PlanQueue = require("../models/PlanQueue");
    const Plan = require("../models/Plan");

    // Get all pending queued plans, sorted by position
    const queuedPlans = await PlanQueue.find({
      member: memberId,
      status: "Pending",
    })
      .sort({ queuePosition: 1 })
      .populate("plan");

    if (queuedPlans.length === 0) {
      return { updatedCount: 0, queuedPlans: [] };
    }

    // Recalculate dates for each queued plan
    let currentBaseDate = new Date(newActiveExpiryDate); // Start from new active plan expiry

    const updatePromises = queuedPlans.map(async (queueItem, index) => {
      // Calculate new scheduled start date
      const scheduledStartDate = index === 0 ? currentBaseDate : new Date(currentBaseDate);

      // Calculate new scheduled expiry date
      const planDuration = queueItem.plan.duration; // in days
      const scheduledExpiryDate = new Date(
        scheduledStartDate.getTime() + planDuration * 24 * 60 * 60 * 1000
      );

      // Update for next plan (which will use this plan's expiry as its start)
      currentBaseDate = new Date(scheduledExpiryDate);

      // Update the queue item
      queueItem.scheduledStartDate = scheduledStartDate;
      queueItem.scheduledExpiryDate = scheduledExpiryDate;
      await queueItem.save();

      return queueItem;
    });

    const updatedQueuedPlans = await Promise.all(updatePromises);

    console.log(
      `✅ Recalculated ${updatedQueuedPlans.length} queued plans for member ${memberId}`
    );

    return {
      updatedCount: updatedQueuedPlans.length,
      queuedPlans: updatedQueuedPlans,
    };
  } catch (error) {
    console.error("Error recalculating queued plans:", error);
    throw error;
  }
};

/**
 * Activate the next queued plan when current plan expires
 * This function should be called by a cron job or background service
 * @param {String} memberId - Member ID
 * @returns {Boolean} - True if a plan was activated, false otherwise
 */
exports.activateNextQueuedPlan = async (memberId) => {
  try {
    const PlanQueue = require("../models/PlanQueue");

    const member = await Member.findById(memberId);
    if (!member) {
      return false;
    }

    // Find the next pending queued plan
    const nextPlan = await PlanQueue.findOne({
      member: memberId,
      status: "Pending",
      scheduledStartDate: { $lte: new Date() },
    })
      .populate("plan")
      .sort({ scheduledStartDate: 1 });


    if (!nextPlan) {
      return false;
    }

    // Update member with the queued plan details
    member.plan = nextPlan.plan._id;
    member.startDate = nextPlan.scheduledStartDate;
    member.expiryDate = nextPlan.scheduledExpiryDate;
    member.status = "Active";

    // Update the queue record
    nextPlan.status = "Active";

    // Add to plan history
    member.planHistory.push({
      plan: nextPlan.plan._id,
      startDate: nextPlan.scheduledStartDate,
      expiryDate: nextPlan.scheduledExpiryDate,
      purchaseType: nextPlan.purchaseType,
      amount: nextPlan.upgradeDetails?.amountCharged || 0,
      payment: nextPlan.payment,
    });

    // Remove from queue
    member.planQueue = member.planQueue.filter(
      (queueItem) => !queueItem.equals(nextPlan._id)
    );

    await Promise.all([member.save(), nextPlan.save()]);

    return true;
  } catch (error) {
    console.error("Error activating next queued plan:", error);
    return false;
  }
};

/**
 * Check if a plan purchase is valid (upgrade vs new purchase vs queue)
 * NEW LOGIC:
 * - Upgrade: Only if new plan has longer duration (strict check)
 * - Queue: Always allowed for any plan when active plan exists
 * - Downgrade: Blocked for upgrades, but allowed as queue
 * 
 * @param {Object} memberData - Current member data
 * @param {Object} currentPlan - Current active plan
 * @param {Object} newPlan - New plan data
 * @returns {Object} - { type: string, canUpgrade: bool, canQueue: bool, message: string }
 */
exports.determineUpgradeType = (memberData, currentPlan, newPlan) => {
  const today = new Date();
  const hasActivePlan =
    memberData.expiryDate && new Date(memberData.expiryDate) > today;

  // Case 1: No active plan - direct purchase only
  if (!hasActivePlan) {
    return {
      type: "new",
      canUpgrade: false,
      canQueue: false,
      canDirectPurchase: true,
      message: "Direct plan purchase",
    };
  }

  // Case 2: Member has active plan
  const upgradeAllowed = this.isUpgradeAllowed(
    currentPlan.duration,
    newPlan.duration
  );

  // Can upgrade only if new plan duration > current plan duration
  const canUpgrade = upgradeAllowed;

  // Can ALWAYS queue any plan (no duration restrictions for queue)
  const canQueue = true;

  return {
    type: "active_plan_exists",
    canUpgrade,
    canQueue,
    canDirectPurchase: false,
    upgradeDetails: upgradeAllowed
      ? {
          message: `Upgrade available from ${currentPlan.duration} to ${newPlan.duration} days`,
          icon: "star",
        }
      : {
          message: `Cannot upgrade to ${newPlan.duration}-day plan (upgrade requires longer duration)`,
          icon: "info",
        },
    queueMessage: `Queue this plan to start after your current ${currentPlan.duration}-day plan expires`,
  };
};
