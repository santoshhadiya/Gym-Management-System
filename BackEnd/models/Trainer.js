const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: String,
  capacity: {
    type: Number,
    default: 10,
  },
  activeClients: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Full"],
    default: "Active",
  },
});

module.exports = mongoose.model("Trainer", trainerSchema);
