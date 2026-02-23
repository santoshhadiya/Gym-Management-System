const Member = require("../models/Member");
const Plan = require("../models/Plan");
const PlanQueue = require("../models/PlanQueue");
const Payment = require("../models/Payment");
const planService = require("../services/planService");

/**
 * @desc   Calculate upgrade cost for a member
 * @route  POST /api/upgrades/calculate
 * @access Private (Member)
 */
exports.calculateUpgradeCost = async (req, res) => {
  try {
    const { newPlanId } = req.body;

    const member = await Member.findOne({ user: req.user.id }).populate("plan");
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ message: "New plan not found" });
    }

    // Check if member has an active plan
    const today = new Date();
    const hasActivePlan = member.expiryDate && new Date(member.expiryDate) > today;

    if (!hasActivePlan) {
      // Case A: No active plan - direct purchase only
      return res.json({
        type: "no_active_plan",
        canUpgrade: false,
        canQueue: false,
        canDirectPurchase: true,
        message: "No active plan. You can purchase this plan directly.",
        planDetails: {
          name: newPlan.name,
          duration: newPlan.duration,
          price: newPlan.price,
        },
        amountToCharge: newPlan.price,
      });
    }

    // Case B: Has active plan - determine upgrade and queue options
    const eligibility = planService.determineUpgradeType(member, member.plan, newPlan);

    // Check if upgrade is possible
    const canUpgrade = eligibility.canUpgrade || false;
    const canQueue = eligibility.canQueue || false;

    // Calculate upgrade cost if upgrade is possible
    let calculation = null;
    if (canUpgrade) {
      calculation = planService.calculateUpgradeCost(
        member,
        member.plan,
        newPlan
      );

      if (!calculation.allowed) {
        // Upgrade not allowed (e.g., same duration), but queue is still available
        return res.json({
          type: "queue_only",
          canUpgrade: false,
          canQueue: true,
          message: eligibility.queueMessage || "You can queue this plan for later.",
          planDetails: {
            name: newPlan.name,
            duration: newPlan.duration,
            price: newPlan.price,
          },
          amountToCharge: newPlan.price,
        });
      }
    }

    // Return response with both options available
    return res.json({
      type: "active_plan_options",
      canUpgrade,
      canQueue,
      currentPlan: canUpgrade && calculation ? calculation.currentPlan : {
        name: member.plan.name,
        duration: member.plan.duration,
      },
      newPlan: {
        name: newPlan.name,
        duration: newPlan.duration,
        price: newPlan.price,
      },
      ...(canUpgrade && calculation && {
        calculation: calculation.calculation,
        upgrade: calculation.upgrade,
        newExpiryDate: calculation.newExpiryDate,
      }),
      message: eligibility.message || "Choose to upgrade now or queue for later.",
    });
  } catch (error) {
    console.error("Error calculating upgrade cost:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get membership details with plan queue
 * @route  GET /api/upgrades/membership-details
 * @access Private (Member)
 */
exports.getMembershipDetails = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id })
      .populate("plan")
      .populate({
        path: "planQueue",
        populate: [
          { path: "plan", select: "name duration price" },
          { path: "payment", select: "amount status paidAt" },
        ],
      });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Calculate remaining days for current plan
    const today = new Date();
    let remainingDays = 0;
    if (member.expiryDate && new Date(member.expiryDate) > today) {
      const diff = new Date(member.expiryDate).getTime() - today.getTime();
      remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return res.json({
      currentPlan: member.plan,
      startDate: member.startDate,
      expiryDate: member.expiryDate,
      remainingDays,
      status: member.status,
      queuedPlans: member.planQueue || [], // Contains auto-recalculated dates after upgrades
    });
  } catch (error) {
    console.error("Error fetching membership details:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get plan history for a member
 * @route  GET /api/upgrades/history
 * @access Private (Member)
 */
exports.getPlanHistory = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id }).populate({
      path: "planHistory.plan",
      select: "name duration price",
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json(member.planHistory || []);
  } catch (error) {
    console.error("Error fetching plan history:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Get all available plans with upgrade eligibility
 * @route  GET /api/upgrades/available-plans
 * @access Private (Member)
 */
exports.getAvailablePlans = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id }).populate("plan");
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const allPlans = await Plan.find({ status: "Active" }).sort("duration");

    const plansWithEligibility = allPlans.map((plan) => {
      const eligibility = planService.determineUpgradeType(
        member,
        member.plan,
        plan
      );

      return {
        ...plan.toObject(),
        eligibility: {
          type: eligibility.type,
          canPurchase: eligibility.canProceed,
          message: eligibility.message,
        },
      };
    });

    return res.json(plansWithEligibility);
  } catch (error) {
    console.error("Error fetching available plans:", error);
    res.status(500).json({ message: error.message });
  }
};
