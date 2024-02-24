import { initTRPC } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "http";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { observable } from "@trpc/server/observable";
import { EventEmitter, WebSocketServer } from "ws";
import { z } from "zod";
import cors from "cors";
import { devices } from "./../db/schema/devices";
import { Database } from "./../db/database";
import { devicesList, getDevices } from "./../db/controllers/devices";

// TODO split this up into files
function createContext(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts: CreateHTTPContextOptions | CreateWSSContextFnOptions
) {
  return {};
}
type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();
const publicProcedure = t.procedure;
const router = t.router;

export const eventEmitter = new EventEmitter();

const connectionStatusRouter = router({
  connectionStatus: publicProcedure.query(() => {
    return "Connected";
  }),
  webSocketStatus: publicProcedure.subscription(() => {
    return observable<{ status: number }>((emit) => {
      const timer = setInterval(() => {
        emit.next({ status: 200 });
      }, 200);

      return () => {
        clearInterval(timer);
      };
    });
  }),
});

const devicesRouter = router({
  get: publicProcedure.query(() => {
    eventEmitter.emit("devices");
    return {};
  }),
  sub: publicProcedure.subscription(() => {
    return observable<{ devices: devicesList }>((emit) => {
      const broadcast = () => {
        getDevices().then((devices) => {
          emit.next({ devices: devices });
        });
      };

      eventEmitter.on("devices", () => {
        broadcast();
      });
      return () => {
        eventEmitter.off("devices", broadcast);
      };
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        ip: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ input }) => {
      Database.db.insert(devices).values(input).execute();
      eventEmitter.emit("devices");
      return {};
    }),
});

// Merge routers together
const appRouter = router({
  post: devicesRouter,
  connectionStatus: connectionStatusRouter,
});
export type AppRouter = typeof appRouter;

const handler = createHTTPHandler({
  router: appRouter,
  middleware: cors(),
  createContext() {
    return {};
  },
});
export const server = createServer((req, res) => {
  if (req.url?.startsWith("/api")) {
    // Send for TRPC to handle
    return handler(req, res);
  }

  // Handle all other requests ourselves
  if (req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Hello World!");
    res.end();
  } else {
    // This will be where we'll handle our static files
    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("404 Error");
    res.end();
  }
});

// ws server
const wss = new WebSocketServer({ server });
applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext,
});

setInterval(() => {
  console.log(
    "Connected clients", wss.clients.size
  );
}, 1000);
