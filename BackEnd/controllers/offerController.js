const Offer = require("../models/Offer");
const Plan = require("../models/Plan");

// Get all offers
exports.getOffers = async (req, res) => {
  const offers = await Offer.find().populate(
    "plan",
    "name price originalPrice",
  );

  res.json(offers);
};

// Create or Re-Activate Offer
exports.createOffer = async (req, res) => {
  try {
    const {
      planId,
      discountType,
      discountValue,
      startDate,
      endDate,
    } = req.body;

    // Find plan
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Find any existing offer (active or inactive)
    let offer = await Offer.findOne({ plan: planId });

    // If already active → block
    if (offer && offer.isActive) {
      return res.status(400).json({
        message: "This plan already has an active offer",
      });
    }

    // Calculate new price
    let newPrice = plan.originalPrice;

    if (discountType === "percentage") {
      newPrice =
        plan.originalPrice -
        (plan.originalPrice * discountValue) / 100;
    } else if (discountType === "flat") {
      newPrice = plan.originalPrice - discountValue;
    }

    newPrice = Math.max(newPrice, 0);

    // If offer exists (but inactive) → reuse
    if (offer) {
      offer.discountType = discountType;
      offer.discountValue = discountValue;
      offer.startDate = startDate;
      offer.endDate = endDate;
      offer.isActive = true;

      await offer.save();
    } 
    // Else create new
    else {
      offer = await Offer.create({
        plan: planId,
        discountType,
        discountValue,
        startDate,
        endDate,
        isActive: true,
      });
    }

    // Update plan
    plan.price = newPrice;
    plan.offer = offer._id;

    await plan.save();

    res.status(201).json({
      message: "Offer applied successfully",
      offer,
      plan,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// Deactivate offer
exports.deactivateOffer = async (req, res) => {
  try {
    const { planId } = req.params;

    const offer = await Offer.findOne({
      plan: planId,
      isActive: true,
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    offer.isActive = false;
    await offer.save();

    const plan = await Plan.findById(planId);

    // Restore price
    plan.price = plan.originalPrice;
    plan.offer = null;

    await plan.save();

    res.json({ message: "Offer deactivated" });
  } catch (err) {
    console.log(err);
  }
};
