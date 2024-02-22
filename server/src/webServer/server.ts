import { initTRPC } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import {
  createHTTPHandler,
  createHTTPServer,
} from "@trpc/server/adapters/standalone";
import { createServer } from "http";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { observable } from "@trpc/server/observable";
import { WebSocketServer } from "ws";
import { z } from "zod";
import cors from "cors";

// This is how you initialize a context for the server
function createContext(
  opts: CreateHTTPContextOptions | CreateWSSContextFnOptions
) {
  return {};
}
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const router = t.router;

const greetingRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input }) => `Hello, ${input.name}!`),
});

const postRouter = router({
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
  randomNumber: publicProcedure.subscription(() => {
    return observable<{ randomNumber: number }>((emit) => {
      const timer = setInterval(() => {
        // emits a number every second
        emit.next({ randomNumber: Math.random() });
      }, 200);

      return () => {
        clearInterval(timer);
      };
    });
  }),
});

// Merge routers together
const appRouter = router({
  greeting: greetingRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;

// http server
/**export const server = createHTTPServer({
  router: appRouter,
  createContext,
  middleware: cors(),
});*/
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
  if (req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Hello World!");
    res.end();
  } else {
    handler(req, res);
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
  console.log("Connected clients", wss.clients.size);
}, 1000);
