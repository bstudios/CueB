import { useEffect, useState } from "react";
import { trpc } from "../trpc/TRPCProvider";
import { Badge } from "@mantine/core";


export const ConnectionStatus = () => {
  const [connected, setConnected] = useState(false);
  const [lastHeardFromServer, setLastHeardFromServer] = useState(0);
  trpc.connectionStatus.webSocketStatus.useSubscription(undefined, {
    onStarted() {
      console.log("started");
    },
    onData(data) {
      if (data.status === 200) {
        setLastHeardFromServer(Date.now())
        setConnected(true);
      }
    },
    onError(err) {
      console.error('error', err);
    }
  });
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastHeardFromServer > 2000) {
        setConnected(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [lastHeardFromServer]);

  if (!connected) return (<Badge color="red" fullWidth>Disconnected from Server</Badge>)
  else return (<Badge variant="dot" color="green">Connected to Server</Badge>)
}
