import { initTRPC } from "@trpc/server";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const trpcContext = initTRPC.create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = trpcContext.router;
export const publicProcedure = trpcContext.procedure;
