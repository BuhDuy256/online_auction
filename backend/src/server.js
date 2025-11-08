BigInt.prototype.toJSON = function () {
  return this.toString();
};

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "./database/prisma.js";

// routers
import authRouter from "./api/routes/auth.route.js";
import userRouter from "./api/routes/user.route.js";
import conversationRouter from "./api/routes/conversation.route.js";
import messageRoutes from "./api/routes/message.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  // Cấu hình CORS cho Socket.io
  cors: {
    origin: "http://localhost:5173", // URL của app React (Vite) của bạn
    methods: ["GET", "POST"],
  },
});

// Middleware xác thực cho Socket.io
io.use((socket, next) => {
  // Client sẽ gửi token qua 'socket.auth.token'
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
    // Gắn thông tin user vào socket để dùng sau
    socket.user = user;
    next();
  });
});

// Xử lý khi có client kết nối
io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.user.username} (ID: ${socket.id})`);

  try {
    // 1. Lấy tất cả các cuộc hội thoại mà user này tham gia
    const conversations = await prisma.participant.findMany({
      where: {
        userId: socket.user.id, // socket.user đã được gán từ middleware
      },
      select: {
        conversationId: true,
      },
    });

    // 2. Cho user join tất cả các "room" (phòng) tương ứng
    conversations.forEach((convo) => {
      // quan trọng: chuyển BigInt thành String
      const roomId = convo.conversationId.toString();
      socket.join(roomId);
      console.log(`User ${socket.user.username} joined room ${roomId}`);
    });
  } catch (error) {
    console.error(`Failed to join rooms for user ${socket.user.id}:`, error);
  }

  // Xử lý khi client ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/conversations", conversationRouter);
app.use("/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server (Express + Socket.io) running on port ${PORT}`);
});
