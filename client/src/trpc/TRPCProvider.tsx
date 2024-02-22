import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { ReactNode, useState } from "react";
import type { AppRouter } from "../../../server/src/webServer/server";
export const trpc = createTRPCReact<AppRouter>();

//import { WebSocket } from "ws";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
//globalThis.WebSocket = WebSocket as any;

// https://github.com/trpc/trpc/discussions/2044 appears to have some good examples?

export const TRPCProvider = ({ children }: { children?: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [wsClient] = useState(() =>
    createWSClient({
      url: "ws://localhost:2022",
      onOpen: () => console.log("Socket Connected"),
      onClose: () => console.log("Socket Disconnected"),
    })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            return op.type === "subscription";
          },
          true: wsLink({
            client: wsClient,
          }),
          false: httpBatchLink({
            url: `http://localhost:2022`,
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
