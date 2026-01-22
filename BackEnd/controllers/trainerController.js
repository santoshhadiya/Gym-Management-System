const User = require("../models/User");
const Member = require("../models/Member");
// GET /api/trainers
exports.getAllTrainers = async (req, res) => {
  const trainers = await User.find({ role: "trainer" }).select(
    "name trainerDetails",
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
    })),
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
    }),
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
  const trainer = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
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
    members.map((m) => ({
      _id: m._id,
      name: m.user.name,
      plan: m.plan?.name || "-",
    })),
  );
};

exports.getTrainerProfile = async (req, res) => {
  const trainer = await User.findById(req.user.id);

  if (!trainer || trainer.role !== "trainer") {
    return res.status(404).json({ message: "Trainer not found" });
  }

  res.json(trainer);
};

// @desc    Update trainer profile (self)
// @route   PUT /api/trainers/profile
// @access  Private (Trainer)
exports.updateTrainerProfile = async (req, res) => {
  try {
    const trainer = await User.findById(req.user.id);

    if (!trainer || trainer.role !== "trainer") {
      return res.status(404).json({ message: "Trainer not found" });
    }

    //  no allow password update here
    delete req.body.password;

    trainer.name = req.body.name || trainer.name;
    trainer.phone = req.body.phone || trainer.phone;
    trainer.profileImage = req.body.profileImage || trainer.profileImage;

    if (req.body.trainerDetails) {
      Object.keys(req.body.trainerDetails).forEach((key) => {
        if (req.body.trainerDetails[key] !== undefined) {
          trainer.trainerDetails[key] = req.body.trainerDetails[key];
        }
      });
    }


    try {
      const updatedTrainer = await trainer.save();
    } catch (error) {
      console.log(error);
    }


    res.json(updatedTrainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
