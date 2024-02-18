import { publicProcedure, router } from "./trpc";
import { z as zod } from "zod";
import { EventEmitter } from "events";
import { initTRPC } from "@trpc/server";

import * as trpcExpress from "@trpc/server/adapters/express";
export const eventEmitter = new EventEmitter();

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context
type Context = Awaited<ReturnType<typeof createContext>>;
const trpcContext = initTRPC.context<Context>().create();

export const appRouter = trpcContext.router({
  userList: publicProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    const delay = await new Promise((resolve) => setTimeout(resolve, 1000));
    const users = [
      {
        id: 1,
        name: "John Doe",
        email: "",
      },
      {
        id: 2,
        name: "Joe Doe",
        email: "",
      },
    ];
    return users;
  }),
  userById: publicProcedure
    .input(zod.string())
    .query(async (opts: { input: any }) => {
      const delay = await new Promise((resolve) => setTimeout(resolve, 1000));
      const { input } = opts;

      const user = [
        {
          id: 1,
          name: "John Doe",
          email: "",
        },
      ];
      return user;
    }),

  userCreate: publicProcedure
    .input(zod.object({ name: zod.string() }))
    .mutation(async (opts: { input: any }) => {
      const delay = await new Promise((resolve) => setTimeout(resolve, 1000));
      const { input } = opts;
      // Create a new user in the database
      const user = [
        {
          id: 3,
          name: "New User",
          email: "",
        },
      ];
      return user;
    }),
});

export type AppRouter = typeof appRouter;
