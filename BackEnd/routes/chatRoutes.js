const express = require("express");
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} = require("../controllers/chatController");
const {chatWithGemini}=require("../controllers/geminiController");

const { protect } = require("../middlewares/authMiddleware");

router.post("/gemini", chatWithGemini);
router.use(protect);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/conversation", startConversation);
router.post("/message", sendMessage);

module.exports = router;