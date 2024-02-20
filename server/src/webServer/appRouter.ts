import { publicProcedure, router } from "./trpc";
import { z as zod } from "zod";
import { EventEmitter } from "events";
import { observable } from "@trpc/server/observable";


export const eventEmitter = new EventEmitter();

export const appRouter = router({
  onAdd: publicProcedure.subscription(() => {
    // return an `observable` with a callback which is triggered immediately
    return observable<string>((emit) => {
      const onAdd = (data: string) => {
        // emit data to client
        emit.next(data);
      };
      // trigger `onAdd()` when `add` is triggered in our event emitter
      eventEmitter.on("add", onAdd);
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        eventEmitter.off("add", onAdd);
      };
    });
  }),
  add: publicProcedure
    .input(
      zod.object({
        id: zod.string().uuid().optional(),
        text: zod.string().min(1),
      })
    )
    .mutation(async (opts) => {
      const post = { ...opts.input }; /* [..] add to db */
      eventEmitter.emit("add", post);
      return post;
    }),

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
