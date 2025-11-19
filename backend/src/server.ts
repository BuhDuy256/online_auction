import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./api/routes/auth.routes";
import productRouter from "./api/routes/product.routes";
import categoryRouter from "./api/routes/category.routes";
import formRouter from "./api/routes/form.routes";
import BidRouter from "./api/routes/bid.route";

import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/forms", formRouter);
app.use("/products/:id/bid", BidRouter);

app.get('/', (_req, res) => {
  res.send('Online Auction API is running');
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
