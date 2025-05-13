const socket = require("socket.io");
const { Chat } = require("../models/chat");

const initialiseSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      console.log("joining room ", roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName,lastName, userId, targetUserId, text }) => {
        const roomId = [userId, targetUserId].sort().join("_");
        console.log(firstName + " " + text);
        try {
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }
          chat.messages.push({ senderId: userId, text });
          await chat.save();

          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
            timestamp: new Date(),
          });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initialiseSocket;
