const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "name email profileImage role")
      .sort({ updatedAt: -1 });

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== req.user.id
      );
      return {
        _id: conv._id,
        participant: otherParticipant, // Consistent field name
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        updatedAt: conv.updatedAt,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("sender", "name profileImage") // Ensure sender is populated
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start a conversation or get existing one
// @route   POST /api/chat/conversation
// @access  Private
exports.startConversation = async (req, res) => {
  const { receiverId } = req.body;

  try {
    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });

    if (conversation) {
        // If exists, populate and return formatted
        await conversation.populate("participants", "name email profileImage role");
        
        const otherParticipant = conversation.participants.find(
            (p) => p._id.toString() !== req.user.id
        );

        return res.json({
            _id: conversation._id,
            participant: otherParticipant,
            lastMessage: conversation.lastMessage,
            updatedAt: conversation.updatedAt
        });
    }

    // Create new
    conversation = await Conversation.create({
      participants: [req.user.id, receiverId],
      lastMessage: "",
    });

    await conversation.populate("participants", "name email profileImage role");

    const otherParticipant = conversation.participants.find(
        (p) => p._id.toString() !== req.user.id
    );

    res.status(201).json({
        _id: conversation._id,
        participant: otherParticipant,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/message
// @access  Private
exports.sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;

  try {
    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      text,
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageBy: req.user.id,
      lastMessageAt: Date.now(),
    });

    // Populate sender info for realtime update
    await message.populate("sender", "name profileImage");

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};