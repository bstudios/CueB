import { initTRPC } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "http";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { observable } from "@trpc/server/observable";
import { WebSocketServer } from "ws";
import { z } from "zod";
import cors from "cors";

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

const postRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input }) => `Hello, ${input.name}!`),
  createPost: publicProcedure
    .input(
      z.object({
        title: z.string(),
        text: z.string(),
      })
    )
    .mutation(({ input }) => {
      // imagine db call here
      return {
        id: `${Math.random()}`,
        ...input,
      };
    }),
});

// Merge routers together
const appRouter = router({
  post: postRouter,
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
  /**
   * Handle the request however you like,
   * just call the tRPC handler when you're ready
   */
  if (req.url?.startsWith("/api")) {
    return handler(req, res);
  }

  if (req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Hello World!");
    res.end();
  } else {
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
