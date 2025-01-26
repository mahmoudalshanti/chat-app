import { Server } from "socket.io";
import express from "express";
import http from "http";
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
const userSocketMap = {};

// listen to connection that comming from client
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // get user id from query
  const userId = socket.handshake.query.userId;

  // set socket id value to user id key  for who enterd user
  if (userId) userSocketMap[userId] = socket.id;

  // send keys of online users of id where save in db
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    // if disconnect user delete him by his key
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
