import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import initDB from "./lib/db.js";
const app = express();
dotenv.config();

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
await initDB();
app.listen(PORT, () => {
  console.log("Server Started at " + PORT + "\n");
});
