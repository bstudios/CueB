import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import cors from "cors";
import { appRouter } from "./appRouter";
import { Server } from "http";
import { WebSocketServer } from "ws";

export class TRPCServer {
  static wss;
  static server: Server;
  constructor() {
    TRPCServer.server = createHTTPServer({
      router: appRouter,
      middleware: cors(),
    });
    TRPCServer.wss = new WebSocketServer({
      server: TRPCServer.server,
    });
    const handler = applyWSSHandler({ wss: TRPCServer.wss, router: appRouter });

    TRPCServer.wss.on("connection", (ws) => {
      console.log(`➕➕ Connection (${TRPCServer.wss.clients.size})`);
      ws.once("close", () => {
        console.log(`➖➖ Connection (${TRPCServer.wss.clients.size})`);
      });
    });
    console.log("✅ WebSocket Server listening on ws://localhost:3001");

    process.on("SIGTERM", () => {
      console.log("SIGTERM");
      handler.broadcastReconnectNotification();
      TRPCServer.wss.close();
    });
  }
}
