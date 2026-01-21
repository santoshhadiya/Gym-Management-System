const User = require("../models/User");

// GET /api/trainers
exports.getAllTrainers = async (req, res) => {
  const trainers = await User.find({ role: "trainer" }).select(
    "name trainerDetails"
  );

  res.json(
    trainers.map((t) => ({
      _id: t._id,
      name: t.name,
      specialization: t.trainerDetails?.specialization,
      capacity: t.trainerDetails?.capacity || 10,
      activeClients: t.trainerDetails?.activeClients || 0,
      status:
        t.trainerDetails?.activeClients >= t.trainerDetails?.capacity
          ? "Full"
          : "Active",
    }))
  );
};


// GET /api/trainers/data
exports.getAllTrainersData = async (req, res) => {
  const trainers = await User.find({ role: "trainer" });

  const enriched = await Promise.all(
    trainers.map(async (t) => {
      const activeMembers = await Member.countDocuments({
        assignedTrainer: t._id,
      });

      return {
        _id: t._id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        gender: t.gender,
        status: t.status,
        joinDate: t.createdAt,
        specialization: t.trainerDetails?.specialization,
        experience: t.trainerDetails?.experience,
        certifications: t.trainerDetails?.certifications,
        schedule: t.trainerDetails?.schedule,
        performance: {
          rating: t.trainerDetails?.rating || 0,
          totalSessions: t.trainerDetails?.totalSessions || 0,
          activeMembers,
        },
        salary: t.trainerDetails?.salary,
      };
    })
  );

  res.json(enriched);
};


// POST /api/trainers
exports.createTrainer = async (req, res) => {
  const trainer = await User.create({
    ...req.body,
    role: "trainer",
    trainerDetails: req.body.trainerDetails,
  });
  res.status(201).json(trainer);
};

// PUT /api/trainers/:id
exports.updateTrainer = async (req, res) => {
  const trainer = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(trainer);
};

// PATCH /api/trainers/:id/deactivate
exports.deactivateTrainer = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "Inactive" });
  res.json({ message: "Trainer deactivated" });
};

// GET /api/trainers/:id/members
exports.getTrainerMembers = async (req, res) => {
  const members = await Member.find({
    assignedTrainer: req.params.id,
  })
    .populate("user", "name")
    .populate("plan", "name");

  res.json(
    members.map(m => ({
      _id: m._id,
      name: m.user.name,
      plan: m.plan?.name || "-",
    }))
  );
};

