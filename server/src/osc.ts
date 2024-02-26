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
  static devicePingChecks: {
    [deviceId: number]: {
      lastPingTimestamp: number;
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
          msg.length === 2 &&
          typeof msg[1] === "number"
        ) {
          const deviceId = OSC.ipsToDevices[rinfo.address];
          if (deviceId) {
            OSC.devicePingChecks[deviceId].lastPingTimestamp = Date.now();
            if (OSC.deviceStatus[deviceId] !== msg[1]) {
              OSC.deviceStatus[deviceId] = msg[1];
              eventEmitter.emit("trpc.deviceStatus");
            }
          }
        } else if (msg[0].startsWith("/cueb/pong/") && msg.length === 1) {
          const deviceId = OSC.ipsToDevices[rinfo.address];
          if (deviceId) {
            OSC.devicePingChecks[deviceId].lastPingTimestamp = Date.now();
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

    OSC.devicePingChecks[deviceId] = {
      sendInterval: setInterval(() => {
        // Devices timeout after 5000ms of no pings received from a server
        if (
          Date.now() - OSC.devicePingChecks[deviceId].lastPingTimestamp >
          4000
        ) {
          OSC.messageDevice(deviceId, "/cueb/ping/");
        }
      }, 500),
      checkInterval: setInterval(() => {
        // We should mark a device as timed out if we haven't heard from it for 3 seconds - it should be transmitting its state every 2 seconds 
        if (
          Date.now() - OSC.devicePingChecks[deviceId].lastPingTimestamp >
          3000
        ) {
          OSC.deviceStatus[deviceId] = false;
          eventEmitter.emit("trpc.deviceStatus");
        }
      }, 500),
      lastPingTimestamp: 0,
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
  static messageDevice(
    deviceId: number,
    message: string,
    ...args: ArgumentType[]
  ) {
    const msg = new Message(message, ...args);
    OSC.devices[deviceId].send(msg);
  }
}
