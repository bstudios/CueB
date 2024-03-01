import { initTRPC } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "http";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { observable } from "@trpc/server/observable";
import { WebSocketServer } from "ws";
import { EventEmitter } from "events";
import { z } from "zod";
import cors from "cors";
import path from "path";
import url from "url";
import fs from "fs";
import {
  DevicesList,
  createDevice,
  deleteDevice,
  getDevices,
  syncDevice,
} from "./db/controllers/devices";
import { OSC } from "./osc";
import { mimeTypes } from "./utils/mimeTypes";
import { scanForDevices } from "./utils/scanForDevices";

function createContext(
  _opts: CreateHTTPContextOptions | CreateWSSContextFnOptions
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
  sub: publicProcedure.subscription(() => {
    return observable<{ devices: DevicesList }>((emit) => {
      const broadcast = () => {
        getDevices().then((DevicesList) => {
          emit.next({ devices: DevicesList });
        });
      };

      // When client joins, send them the current devices
      broadcast();

      eventEmitter.on("trpc.devices", () => {
        broadcast();
      });
      return () => {
        eventEmitter.off("trpc.devices", broadcast);
      };
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        ip: z.string(),
        name: z.string(),
        port: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await createDevice(input);
      eventEmitter.emit("trpc.devices");
      return {};
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      deleteDevice(input.id);
      eventEmitter.emit("trpc.devices");
      return {};
    }),
  requestSync: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      // Get the config from the device and set it up as the new config
      const sync = await syncDevice(input.id);
      if (sync) eventEmitter.emit("trpc.devices");
      return sync;
    }),
  subStatus: publicProcedure.subscription(() => {
    return observable<{ [deviceId: number]: number | false }>((emit) => {
      const broadcast = () => {
        emit.next(OSC.deviceStatus);
      };

      // When client joins, send them the current devices
      broadcast();

      eventEmitter.on("trpc.deviceStatus", () => {
        broadcast();
      });
      return () => {
        eventEmitter.off("trpc.deviceStatus", broadcast);
      };
    });
  }),
  setState: publicProcedure
    .input(z.object({ id: z.number(), newState: z.number() }))
    .mutation(({ input }) => {
      OSC.messageDevice(input.id, "/cueb/outstationState", input.newState);
      return {};
    }),
  scanForDevices: publicProcedure.mutation(() => {
    return scanForDevices();
  }),
});

// Merge routers together
const appRouter = router({
  devices: devicesRouter,
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
    const newReq = req;
    newReq.url = newReq.url?.replace(/^\/api/, "");
    return handler(newReq, res);
  }
  if (req.url !== undefined) {
    const parsedUrl = url.parse(req.url);
    if (parsedUrl.pathname !== null) {
      const sanitizePath = path
        .normalize(parsedUrl.pathname)
        .replace(/^(\.\.[/\\])+/, "");
      let pathname = path.join(__dirname, "../../public/", sanitizePath);

      fs.exists(pathname, function (exist) {
        if (!exist) {
          // if the file is not found, return 404
          res.statusCode = 404;
          res.end(`File ${pathname} not found!`);
          return;
        }

        // if is a directory, then look for index.html
        if (fs.statSync(pathname).isDirectory()) {
          pathname += "/index.html";
        }

        // read file from file system
        fs.readFile(pathname, function (err, data) {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            // based on the URL path, extract the file extention. e.g. .js, .doc, ...
            const ext = path.parse(pathname).ext;
            // if the file is found, set Content-type and send data
            res.setHeader("Content-type", mimeTypes[ext] || "text/plain");
            res.end(data);
          }
        });
      });
    }
  }
});

// ws server
const wss = new WebSocketServer({ server });
applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext,
});
