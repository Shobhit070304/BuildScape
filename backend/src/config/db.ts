import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured before the API can start");
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}
