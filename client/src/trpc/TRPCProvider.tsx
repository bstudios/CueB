import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { ReactNode, useState } from "react";
import { trpc } from "./trpc";

export const TRPCProvider = ({ children }: { children?: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [wsClient] = useState(() => createWSClient({ url: "ws://localhost:3000", onOpen: () => console.log("Socket Connected"), onClose: () => console.log("Socket Disconnected") }));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            return op.type === "subscription";
          },
          false: httpBatchLink({
            url: "http://localhost:3000/api",
          }),
          true: wsLink({ client: wsClient }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
