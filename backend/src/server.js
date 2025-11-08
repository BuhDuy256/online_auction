BigInt.prototype.toJSON = function () {
  return this.toString();
};

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// routers
import authRouter from "./api/routes/auth.route.js";
import userRouter from "./api/routes/user.route.js";
import conversationRouter from "./api/routes/conversation.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/conversations", conversationRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
