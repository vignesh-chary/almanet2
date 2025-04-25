import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
  },
});

// Store online users { userId: socketId }
const userSocketMap = {};

// Store project rooms { projectId: Set<socketId> }
const projectRooms = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Project-related events
  socket.on("join-project", (projectId) => {
    socket.join(projectId);
    if (!projectRooms[projectId]) {
      projectRooms[projectId] = new Set();
    }
    projectRooms[projectId].add(socket.id);
  });

  socket.on("leave-project", (projectId) => {
    socket.leave(projectId);
    if (projectRooms[projectId]) {
      projectRooms[projectId].delete(socket.id);
    }
  });

  socket.on("new-task", (data) => {
    io.to(data.projectId).emit("task-added", data);
  });

  socket.on("update-task", (data) => {
    io.to(data.projectId).emit("task-updated", data);
  });

  socket.on("new-message", (data) => {
    io.to(data.projectId).emit("message-received", data);
  });

  socket.on("new-file", (data) => {
    io.to(data.projectId).emit("file-uploaded", data);
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    
    // Remove user from all project rooms
    Object.keys(projectRooms).forEach(projectId => {
      if (projectRooms[projectId].has(socket.id)) {
        projectRooms[projectId].delete(socket.id);
      }
    });

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
