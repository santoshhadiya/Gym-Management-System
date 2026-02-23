const { GoogleGenerativeAI } = require("@google/generative-ai");
const Company = require("../models/Company");
const Plan = require("../models/Plan");
const Trainer = require("../models/Trainer");
const Equipment = require("../models/Equipment");
const Schedule = require("../models/Schedule"); // New Model

const genAI = new GoogleGenerativeAI("AIzaSyDdSZcy8_wCNVHwJZUQh8BmCZPUNREXo4g");

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
      Your tone is professional, high-energy, and concise.

      STRATEGIC DIRECTIVES:
      - **Brevity is King**: Keep responses under 3 sentences unless explaining a complex plan.
      - **No Fluff**: Do not repeat the user's question. Provide the answer immediately.
      - **Action-Oriented**: Always suggest the next logical step (e.g., "Should I book a trial with a trainer?").
      - **Analysis over Lists**: Instead of listing all hours, say "We're open late tonight until [Time]."

      DATASET:
      - **Schedules**: ${schedules.map(s => `${s.day}: ${s.isClosed ? 'Closed' : s.hours}`).join(" | ")}
      
      - **Trainers**: ${trainers.map(t => `${t.user?.name} (${t.specialization}) - Space: ${t.capacity - t.activeClients} left`).join(" | ")}

      - **Plans**: ${plans.map(p => `${p.name} (${p.price} INR): ${p.features.slice(0, 2).join(", ")}`).join(" | ")}

      - **Facilities**: Focus on ${[...new Set(gear.map(g => g.category))].join(", ")}.
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