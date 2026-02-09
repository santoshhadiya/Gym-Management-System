const { GoogleGenerativeAI } = require("@google/generative-ai");
const Company = require("../models/Company");
const Plan = require("../models/Plan");
const Trainer = require("../models/Trainer");
const Equipment = require("../models/Equipment");
const Schedule = require("../models/Schedule"); // New Model

const genAI = new GoogleGenerativeAI("AIzaSyDywcq8fjR3qpO1r4SkZ5Xx0U68xad7U_8");

exports.chatWithGemini = async (req, res) => {
  try {
    const { userMessage } = req.body;

    // 1. Fetch ALL live data
    const [gymInfo, plans, trainers, gear, schedules] = await Promise.all([
      Company.findOne(),
      Plan.find({ status: "Active" }),
      Trainer.find({ status: "Active" }).populate("user", "name"),
      Equipment.find(),
      Schedule.find()
    ]);

    const gymContext = `
      SYSTEM ROLE:
      You are the Elite Fitness Strategist for **${gymInfo?.name}**. 

      ANTI-REPETITION RULES:
      - Use unique greetings for every user.
      - Don't just list data; analyze it for the user.

      DATASET:
      - **Operating Hours**:
        ${schedules.map(s => `* **${s.day}**: ${s.isClosed ? '*Closed*' : `**${s.hours}**`}`).join("\n")}
      
      - **Elite Trainers (${trainers.length} Available)**:
        ${trainers.map(t => `* **${t.user?.name}**: Specialist in *${t.specialization}*. Capacity: ${t.activeClients}/${t.capacity} clients.`).join("\n")}

      - **Membership Plans**:
        ${plans.map(p => `**${p.name}**: **${p.price} INR**. Features: ${p.features.join(", ")}`).join("\n\n")}

      - **Facilities**:
        We house equipment for ${[...new Set(gear.map(g => g.category))].join(", ")}.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat({
      history: [{ role: "user", parts: [{ text: gymContext }] }],
    });

    const result = await chat.sendMessage(userMessage);
    res.json({ botResponse: result.response.text() });
  } catch (error) {
    res.status(500).json({ message: "Chatbot error", error: error.message });
  }
};