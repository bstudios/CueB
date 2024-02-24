import { eq } from "drizzle-orm";
import { Database } from "../database";
import { devices } from "../schema/devices";

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
