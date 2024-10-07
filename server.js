const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.use(cors());

async function storeMessage(messageDetails) {
  const response = await fetch(`${process.env.SERVER_URL}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${messageDetails.token}`,
    },
    body: JSON.stringify({
      data: {
        sender_id: messageDetails.userId,
        message_content: messageDetails.message,
        sender_type: messageDetails.senderType,
        chat_session_id: messageDetails.sessionId,
      },
    }),
  });
}

// Handle socket connection
io.on("connection", (socket) => {
  console.log("A new client connected");

  // Listen for messages from the client
  socket.on("message", (msg) => {
    let messageData = JSON.parse(JSON.stringify(msg));

    // Echo the message back to the client
    socket.emit("message", `${messageData.message}`);
    storeMessage({ ...messageData, senderType: "client" });
    storeMessage({ ...messageData, senderType: "server" });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// const PORT = 3000;
server.listen(port, () => {
  console.log(`Socket.IO server is running on http://localhost:${port}`);
});
