import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Router from "./Router";
import { DeviceStatusProvider } from "./contexts/DeviceStatusReducer";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import { TRPCProvider } from "./trpc/TRPCProvider";
//<DeviceStatusProvider>
function App() {
  return (
    <>
      <TRPCProvider>
        <ColorSchemeScript defaultColorScheme="auto" />
        <MantineProvider defaultColorScheme="auto">
          <Notifications />

          <Router />
        </MantineProvider>
      </TRPCProvider>
    </>
  );
}

export default App;
