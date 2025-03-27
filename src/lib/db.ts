import mongoose from "mongoose";

import { env } from "@/lib/env";

export const connectDB = () => {
  mongoose.connect(env.DB_URL).then((data) => {
    console.log(`MongoDB Connected with Server: ${data.connection.host}`);
  });
};
