import { createServer as createHttpServer } from "node:http";

import { app } from "@/app";
import { env } from "@/lib/env";

const server = createHttpServer(app);

server.listen({ port: env.PORT }, () => {
  console.log(`Server is live on http://localhost:${env.PORT}`);
});

export { server };
