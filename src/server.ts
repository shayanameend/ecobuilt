import { createServer as createHttpServer } from "node:http";

import { app } from "@/app";
import { env } from "@/lib/env";
import { connectDB } from "@/lib/db";

const server = createHttpServer(app);

connectDB();

server.listen({ port: env.PORT }, () => {
  console.log(`Server is live on http://localhost:${env.PORT}`);
});

export { server };
