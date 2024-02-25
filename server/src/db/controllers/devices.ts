import { eq, and } from "drizzle-orm";
import { Database } from "../database";
import { devices } from "../schema/devices";
import { OSC } from "../../osc";
import { z } from "zod";

export const getDevices = async () => {
  return await Database.db.query.devices.findMany({
    with: {
      channels: true,
    },
  });
};
export type DevicesList = Awaited<ReturnType<typeof getDevices>>;

export const getDevice = async (id: number) => {
  return await Database.db.query.devices.findFirst({
    where: eq(devices.id, id),
  });
};
export type Device = Awaited<ReturnType<typeof getDevice>>;

export const deleteDevice = (id: number) => {
  Database.db.delete(devices).where(eq(devices.id, id)).execute();
  OSC.deleteClient(id);
};

type NewDevice = typeof devices.$inferInsert;
export const createDevice = async (device: NewDevice) => {
  const existingDevices = await Database.db.query.devices.findFirst({
    where: and(eq(devices.ip, device.ip), eq(devices.port, device.port)),
  });
  if (existingDevices) {
    throw new Error("Device with same IP & Port already exists");
  } else {
    const newDevice = await Database.db
      .insert(devices)
      .values(device)
      .returning({
        insertedId: devices.id,
        ip: devices.ip,
        port: devices.port,
      });
    OSC.createClient(
      newDevice[0].insertedId,
      newDevice[0].ip,
      newDevice[0].port
    );
  }
};
export const updateDevice = async (id: number, device: NewDevice) => {
  const existingDevices = await Database.db.query.devices.findFirst({
    where: and(eq(devices.ip, device.ip), eq(devices.port, device.port)),
  });
  if (existingDevices && existingDevices.id !== id) {
    throw new Error("Device with same IP & Port already exists");
  }
  await Database.db
    .update(devices)
    .set(device)
    .where(eq(devices.id, id))
    .execute();
  OSC.deleteClient(id);
  OSC.createClient(id, device.ip, device.port);
};

export const syncDevice = async (id: number) => {
  const deviceIp = await Database.db
    .select({
      ip: devices.ip,
    })
    .from(devices)
    .limit(1)
    .where(eq(devices.id, id));
  if (deviceIp.length !== 1) return false;
  const ip = deviceIp[0].ip;
  const deviceResponse = await fetch(`http://${ip}:80/about.json`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
  if (!deviceResponse.ok) return false;
  const deviceResponseJson = await deviceResponse.json();
  if (!deviceResponseJson) return false;
  const schema = z.object({
    config: z.object({
      name: z.string(),
      "osc-recieveport": z.number(),
    }),
  });
  const deviceData = schema.safeParse(deviceResponseJson);
  if (!deviceData.success) return false;
  await Database.db
    .update(devices)
    .set({
      name: deviceData.data.config.name,
      port: deviceData.data.config["osc-recieveport"],
    })
    .where(eq(devices.id, id))
    .execute();
  return true;
};
