import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import initDB from "./lib/db.js";
import { errorHandler } from "./lib/handlers.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);

app.use(errorHandler);

await initDB();
app.listen(PORT, () => {
  console.log("Server Started at " + PORT + "\n");
});
