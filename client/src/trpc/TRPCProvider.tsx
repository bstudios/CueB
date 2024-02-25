import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { ReactNode, useState } from "react";
import type { AppRouter } from "../../../server/src/server";
import { readLocalStorageValue } from "@mantine/hooks";
export const trpc = createTRPCReact<AppRouter>();
// TODO change the hardcoded address of the server
export const TRPCProvider = ({ children }: { children?: ReactNode }) => {
  const serverAddress = readLocalStorageValue({ key: "serverAddress", defaultValue: window.location.hostname + ":" + window.location.port });
  const [queryClient] = useState(() => new QueryClient());
  const [wsClient] = useState(() =>
    createWSClient({
      url: `ws://${serverAddress}`,
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
            url: `http://${serverAddress}/api`,
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
