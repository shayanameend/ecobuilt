import { createServer as createHttpServer } from "node:http";
import { app } from "@/app";
import { env } from "@/lib/env";
import { connectDB } from "@/lib/db";
import { verifyCloudinaryConnection } from "@/lib/cloudinary";

async function startServer() {
  try {
    // Verify all connections
    await Promise.all([connectDB(), verifyCloudinaryConnection()]);

    const server = createHttpServer(app);

    server.listen({ port: env.PORT }, () => {
      console.log(`Server is live on http://localhost:${env.PORT}`);
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

const server = startServer();

export { server };
