import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { appRouter } from "./appRouter";

import express from "express";

export const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
});

export const expressServer = express();
expressServer.use(cors());
expressServer.use(
  "/api",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
