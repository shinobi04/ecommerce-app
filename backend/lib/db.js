import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const initDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DataBase Connected");
  } catch (e) {
    console.log("error XD" + e);
  }
};

export default initDB;
