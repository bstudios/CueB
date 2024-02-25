import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Router from "./Router";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { TRPCProvider } from "./trpc/TRPCProvider";
function App() {
  return (
    <>
      <TRPCProvider>
        <ColorSchemeScript defaultColorScheme="auto" />
        <MantineProvider defaultColorScheme="auto">
          <Notifications position={"top-right"} />
          <Router />
        </MantineProvider>
      </TRPCProvider>
    </>
  );
}

export default App;
