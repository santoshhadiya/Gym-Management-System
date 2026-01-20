const mongoose = require("mongoose");
const User = require("../models/User");
const Member = require("../models/Member");

mongoose.connect(process.env.MONGO_URI);

(async () => {
  const users = await User.find({ role: "member" });

  for (const user of users) {
    let member = await Member.findOne({ user: user._id });

    if (!member) {
      member = await Member.create({
        user: user._id,
      });
    }

    if (user.memberDetails) {
      member.fitnessGoal =
        user.memberDetails.fitnessGoal || member.fitnessGoal;

      await member.save();

      // 🔥 REMOVE old embedded data
      user.memberDetails = undefined;
      await user.save();

      console.log(`Migrated ${user.email}`);
    }
  }

  console.log("Migration complete");
  process.exit();
})();
