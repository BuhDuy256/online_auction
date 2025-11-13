import express, { Application } from "express";

import authRouter from "./api/routes/auth.route";

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
