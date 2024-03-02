import { Client, Server, Message, ArgumentType } from "node-osc";
import { eventEmitter } from "./server";

const createOSCClient = (host: string, port: number) => new Client(host, port);
const createOSCServer = (port: number) =>
  new Server(port, "0.0.0.0" /* listen to all interfaces */, () =>
    console.log("OSC Server is listening")
  );

export class OSC {
  static listeningPorts: number[] = [];
  static servers: {
    [port: number]: ReturnType<typeof createOSCServer>;
  } = {};
  static devices: {
    [deviceId: number]: ReturnType<typeof createOSCClient>;
  } = {};
  static ipsToDevices: {
    [ip: string]: number;
  } = {};
  static deviceStatus: {
    [deviceId: number]: number | false;
  } = {};
  static deviceResendStatus: {
    [deviceId: number]: {
      deviceNewStatus: number | false;
      deviceSendStatusInterval: NodeJS.Timeout;
    };
  } = {};
  static devicePingChecks: {
    [deviceId: number]: {
      lastPingReceivedTimestamp: number;
      lastPingSentTimestamp: number;
      sendInterval: NodeJS.Timeout;
      checkInterval: NodeJS.Timeout;
    };
  } = {};
  constructor(ports: number[]) {
    OSC.listeningPorts = ports;
    for (const port of ports) {
      OSC.servers[port] = createOSCServer(port);
      OSC.servers[port].on("message", (msg, rinfo) => {
        if (
          msg[0].startsWith("/cueb/outstationState") &&
          msg.length === 3 &&
          typeof msg[1] === "number"
        ) {
          const deviceId = OSC.ipsToDevices[rinfo.address];
          if (deviceId) {
            OSC.devicePingChecks[deviceId].lastPingReceivedTimestamp =
              Date.now();
            if (OSC.deviceStatus[deviceId] !== msg[1]) {
              // Device status has changed! Updated
              OSC.deviceStatus[deviceId] = msg[1];
              if (
                OSC.deviceResendStatus[deviceId]["deviceNewStatus"] == msg[1]
              ) {
                // Status has been set to what we wanted, and device replied to let us know, so we can stop pestering the device
                OSC.deviceResendStatus[deviceId]["deviceNewStatus"] = false;
              }
              eventEmitter.emit("trpc.deviceStatus");
            }
            if (msg[0] === "/cueb/outstationState/confirmInSync") {
              console.log("Returning status back to device", msg[1], deviceId);
              OSC.messageDevice(
                deviceId,
                "/cueb/outstationState/confirmInSync",
                OSC.deviceStatus[deviceId]
              ); // Echo the state back to the device to confirm it was received
            }
          }
        } else if (msg[0] === "/cueb/pong" && msg.length === 2) {
          const deviceId = OSC.ipsToDevices[rinfo.address];
          if (deviceId) {
            OSC.devicePingChecks[deviceId].lastPingReceivedTimestamp =
              Date.now();
            console.log("Pong from device", deviceId);
          }
        } else {
          console.log("Unknown message", msg, rinfo);
        }
      });
    }
  }
  static destroy() {
    for (const port in OSC.servers) {
      OSC.servers[port].close();
    }
    for (const deviceId in OSC.devices) {
      OSC.devices[deviceId].close();
    }
  }
  static createClient(deviceId: number, ip: string, port: number) {
    OSC.ipsToDevices[ip] = deviceId;
    OSC.deviceStatus[deviceId] = false;
    OSC.devices[deviceId] = createOSCClient(ip, port);
    OSC.deviceResendStatus[deviceId] = {
      deviceNewStatus: false,
      deviceSendStatusInterval: setInterval(() => {
        // Resend the device its status if it has not sent it back
        if (
          OSC.deviceResendStatus[deviceId]["deviceNewStatus"] !==
            OSC.deviceStatus[deviceId] &&
          OSC.deviceStatus[deviceId] !== false &&
          OSC.deviceResendStatus[deviceId]["deviceNewStatus"] !== false
        ) {
          console.log(
            "Resending status to device",
            OSC.deviceStatus[deviceId],
            OSC.deviceResendStatus[deviceId]["deviceNewStatus"]
          );
          OSC.messageDevice(
            deviceId,
            "/cueb/outstationState",
            OSC.deviceResendStatus[deviceId]["deviceNewStatus"]
          );
        }
      }, 200),
    };
    OSC.devicePingChecks[deviceId] = {
      sendInterval: setInterval(() => {
        // Devices timeout after 5000ms of no pings received from a server
        if (
          Date.now() - OSC.devicePingChecks[deviceId].lastPingSentTimestamp >=
            3000 ||
          Date.now() -
            OSC.devicePingChecks[deviceId].lastPingReceivedTimestamp >=
            3000
        ) {
          // We haven't either sent the device a message or heard from it for a while - we should ping it. That said, if we haven't heard from it for a long time then we should reduce the frequency of pings to save network bandwidth
          if (
            Date.now() -
              OSC.devicePingChecks[deviceId].lastPingReceivedTimestamp <=
              10000 ||
            Date.now() - OSC.devicePingChecks[deviceId].lastPingSentTimestamp >=
              2000
          ) {
            OSC.messageDevice(deviceId, "/cueb/ping");
            console.log("Pinging device", deviceId);
          }
        }
      }, 200),
      checkInterval: setInterval(() => {
        // We should mark a device as timed out if we haven't heard from it for 5 seconds
        if (
          Date.now() -
            OSC.devicePingChecks[deviceId].lastPingReceivedTimestamp >
          5000
        ) {
          if (OSC.deviceStatus[deviceId] !== false) {
            console.log("Device timed out", deviceId);
            OSC.deviceStatus[deviceId] = false;
            eventEmitter.emit("trpc.deviceStatus");
          }
        }
        if (
          Date.now() -
            OSC.devicePingChecks[deviceId].lastPingReceivedTimestamp <=
            5000 &&
          OSC.deviceStatus[deviceId] === false
        ) {
          // If we're not sure what a device's state is (it probably just joined the network) then we should ask it - it'll reply with it, but only if its actually connected
          console.log("Asking device for status", deviceId);
          OSC.messageDevice(deviceId, "/cueb/outstationState");
        }
      }, 200),
      lastPingReceivedTimestamp: 0,
      lastPingSentTimestamp: 0,
    };
  }
  static deleteClient(deviceId: number) {
    clearInterval(OSC.devicePingChecks[deviceId].sendInterval);
    clearInterval(OSC.devicePingChecks[deviceId].checkInterval);
    delete OSC.devicePingChecks[deviceId];
    OSC.devices[deviceId].close();
    delete OSC.devices[deviceId];
    delete OSC.deviceStatus[deviceId];
    for (const key in OSC.ipsToDevices) {
      if (OSC.ipsToDevices[key] === deviceId) {
        delete OSC.ipsToDevices[key];
      }
    }
  }
  static setStatus(deviceId: number, status: number) {
    if (status !== OSC.deviceStatus[deviceId]) {
      console.log("Setting status", deviceId, status);
      OSC.deviceResendStatus[deviceId]["deviceNewStatus"] = status;
      OSC.messageDevice(deviceId, "/cueb/outstationState", status);
    }
  }
  static messageDevice(
    deviceId: number,
    message: string,
    ...args: ArgumentType[]
  ) {
    const msg = new Message(message, ...args);
    OSC.devices[deviceId].send(msg);
    OSC.devicePingChecks[deviceId].lastPingSentTimestamp = Date.now();
  }
}
