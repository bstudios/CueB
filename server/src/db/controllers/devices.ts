import { eq } from "drizzle-orm";
import { Database } from "../database";
import { devices } from "../schema/devices";
import { OSC } from "../../osc";

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
  const newDevice = await Database.db
    .insert(devices)
    .values(device)
    .returning({ insertedId: devices.id, ip: devices.ip, port: devices.port });
  OSC.createClient(newDevice[0].insertedId, newDevice[0].ip, newDevice[0].port);
};