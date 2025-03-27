import mongoose from "mongoose";

import { env } from "@/lib/env";

export const connectDB = () => {
  mongoose
    .connect(env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`MongoDB Connected with Server: ${data.connection.host}`);
    });
};
