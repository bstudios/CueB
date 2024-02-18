import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/webServer/appRouter";
export const trpc = createTRPCReact<AppRouter>();
