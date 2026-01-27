const socketIo = require("socket.io");

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Adjust this to your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join a room based on user ID for private messaging
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
      }
    });

    // Handle sending message
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
      console.log(`Message from ${senderId} to ${receiverId}:`, message);
      // Emit to receiver's room
      io.to(receiverId).emit("receiveMessage", message);
      // Emit back to sender (optional, useful for multi-device sync)
      // io.to(senderId).emit("messageSent", message);
    });

    // Typing indicators
    socket.on("typing", ({ conversationId, receiverId, isTyping }) => {
        io.to(receiverId).emit("typing", { conversationId, isTyping });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIo };