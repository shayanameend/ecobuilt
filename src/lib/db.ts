import mongoose from "mongoose";
import { env } from "@/lib/env";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected with Server: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
